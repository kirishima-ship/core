/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { EventEmitter } from 'node:events';
import type { KirishimaNodeOptions, KirishimaOptions, KirishimaPlayerOptions } from '../typings';
import crypto from 'node:crypto';

import { KirishimaNode } from './KirishimaNode';
import { GatewayOpcodes } from 'discord-api-types/gateway/v9';
import Collection from '@discordjs/collection';
import { KirishimaPlayer } from './KirishimaPlayer';

export class Kirishima extends EventEmitter {
	public nodes: Collection<string, KirishimaNode> = new Collection();
	public players?: Collection<string, KirishimaPlayer>;
	public constructor(public options: KirishimaOptions) {
		super();

		if (typeof options.send !== 'function') throw Error('Send function must be present and must be a function.');

		if (typeof options.player !== 'function' || typeof options.player === undefined) {
			this.players = new Collection();
			options.player = this.defaultPlayerHandler.bind(this);
		}

		if (!options.nodes.length) throw new Error('Nodes option must not a empty array');
	}

	public async initialize(clientId?: string) {
		if (!clientId && !this.options.clientId) throw new Error('Invalid clientId provided');
		if (clientId && !this.options.clientId) this.options.clientId = clientId;
		return this.setNode(this.options.nodes);
	}

	public async setNode(nodes: KirishimaNodeOptions | KirishimaNodeOptions[]): Promise<Kirishima> {
		const isArray = Array.isArray(nodes);
		if (isArray) {
			for (const node of nodes) {
				const kirishimaNode = new KirishimaNode(node, this);
				await kirishimaNode.connect();
				this.nodes.set((node.identifier ??= crypto.randomBytes(4).toString('hex')), kirishimaNode);
			}
			return this;
		}
		const kirishimaNode = new KirishimaNode(nodes, this);
		await kirishimaNode.connect();
		this.nodes.set((nodes.identifier ??= crypto.randomBytes(4).toString('hex')), kirishimaNode);
		return this;
	}

	public setClientName(clientName: string) {
		this.options.clientName = clientName;
		return this;
	}

	public setClientId(clientId: string) {
		this.options.clientId = clientId;
		return this;
	}

	public resolveTracks(options: string | { source?: string | undefined; query: string }, node?: KirishimaNode) {
		node ??= this.nodes.first();
		return node?.rest.loadTracks(options);
	}

	public async spawnPlayer(options: KirishimaPlayerOptions, node?: KirishimaNode) {
		node ??= this.nodes.first();
		const player = await this.options.player!(options.guildId, options, node!);
		return player.connect();
	}

	private defaultPlayerHandler(guildId: string, options: KirishimaPlayerOptions, node: KirishimaNode) {
		const player = this.players?.has(guildId);
		if (player) return this.players?.get(guildId)!;
		const kirishimaPlayer = new KirishimaPlayer(options, this, node);
		this.players?.set(guildId, kirishimaPlayer);
		return kirishimaPlayer;
	}

	public static createVoiceChannelPayload(options: KirishimaPlayerOptions, leave?: boolean) {
		return {
			op: GatewayOpcodes.VoiceStateUpdate,
			d: {
				guild_id: options.guildId,
				channel_id: leave ? null : options.voiceId,
				self_deaf: (options.selfDeaf ??= false),
				self_mute: (options.selfMute ??= false)
			}
		};
	}
}
