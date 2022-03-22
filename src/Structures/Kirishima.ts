import type { KirishimaNodeOptions, KirishimaPlayerOptions } from '../typings';
import crypto from 'node:crypto';

import { KirishimaNode } from './KirishimaNode';
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/gateway/v9';
import { Structure } from './Structure';

export class Kirishima extends Structure.get('BaseKirishima') {
	public async initialize(clientId?: string) {
		if (!clientId && !this.options.clientId) throw new Error('Invalid clientId provided');
		if (clientId && !this.options.clientId) this.options.clientId = clientId;
		if (this.options.plugins) {
			for (const plugin of [...this.options.plugins.values()]) {
				await plugin.load(this);
			}
		}
		return this.setNodes(this.options.nodes);
	}

	public async setNodes(nodeOrNodes: KirishimaNodeOptions | KirishimaNodeOptions[]): Promise<Kirishima> {
		const isArray = Array.isArray(nodeOrNodes);
		if (isArray) {
			for (const node of nodeOrNodes) {
				const kirishimaNode = new (Structure.get('KirishimaNode'))(node, this);
				await kirishimaNode.connect();
				this.nodes.set((node.identifier ??= crypto.randomBytes(4).toString('hex')), kirishimaNode);
			}
			return this;
		}
		const kirishimaNode = new (Structure.get('KirishimaNode'))(nodeOrNodes, this);
		await kirishimaNode.connect();
		this.nodes.set((nodeOrNodes.identifier ??= crypto.randomBytes(4).toString('hex')), kirishimaNode);
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

	public spawnPlayer(options: KirishimaPlayerOptions, node?: KirishimaNode) {
		return this.options.spawnPlayer!(options.guildId, options, node ?? this.resolveNode()!);
	}

	public async handleVoiceServerUpdate(packet: GatewayVoiceServerUpdateDispatch) {
		for (const node of [...this.nodes.values()]) {
			await node.handleVoiceServerUpdate(packet);
		}
	}

	public async handleVoiceStateUpdate(packet: GatewayVoiceStateUpdateDispatch) {
		for (const node of [...this.nodes.values()]) {
			await node.handleVoiceStateUpdate(packet);
		}
	}

	public async handleRawPacket(t: 'VOICE_SERVER_UPDATE' | 'VOICE_STATE_UPDATE', packet: unknown) {
		if (t === 'VOICE_STATE_UPDATE') {
			await this.handleVoiceStateUpdate(packet as GatewayVoiceStateUpdateDispatch);
		}
		if (t === 'VOICE_SERVER_UPDATE') {
			await this.handleVoiceServerUpdate(packet as GatewayVoiceServerUpdateDispatch);
		}
	}
}
