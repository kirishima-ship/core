import { KirishimaCollection } from '@kirishima/collection';
import { EventEmitter } from 'node:events';
import type { KirishimaNodeOptions, KirishimaOptions, KirishimaPlayerOptions } from '../typings';
import crypto from 'node:crypto';

import { KirishimaNode } from './KirishimaNode';
import { KirishimaPlayer } from './KirishimaPlayer';
import { GatewayOpcodes } from 'discord-api-types/gateway/v9';

export class Kirishima extends EventEmitter {
	public nodes: KirishimaCollection<string, KirishimaNode> = new KirishimaCollection();
	public players: KirishimaCollection<string, KirishimaPlayer> = new KirishimaCollection();
	public constructor(public options: KirishimaOptions) {
		super();
		if (typeof options.send !== 'function') throw Error('send function must be present and must be a function.');
		if (!options.nodes.length) throw new Error('nodes option must not a empty array');
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
				await this.nodes.set(node.identifier ?? crypto.randomBytes(4).toString('hex'), kirishimaNode);
			}
			return this;
		}
		const kirishimaNode = new KirishimaNode(nodes, this);
		await kirishimaNode.connect();
		await this.nodes.set(nodes.identifier ?? crypto.randomBytes(4).toString('hex'), kirishimaNode);
		return this;
	}

	public async spawnPlayer(options: KirishimaPlayerOptions, node?: KirishimaNode) {
		const player = await this.players.get(options.guildId);
		if (player) return player;
		if (!node) node = await this.nodes.first();
		const kirishimaPlayer = new KirishimaPlayer(options, this, node!);
		await this.players.set(options.guildId, kirishimaPlayer);
		return kirishimaPlayer;
	}

	public setClientName(clientName: string) {
		this.options.clientName = clientName;
		return this;
	}

	public setClientId(clientId: string) {
		this.options.clientId = clientId;
		return this;
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
