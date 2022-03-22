import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/gateway/v9';
import { WebsocketOpEnum } from 'lavalink-api-types';
import { KirishimaPlayerOptions, KirishimaNode, createVoiceChannelJoinPayload } from '..';
import { BaseKirishima } from './BaseKirishima';

export class BasePlayer {
	public voiceServer: GatewayVoiceServerUpdateDispatch['d'] | undefined;
	public voiceState: GatewayVoiceStateUpdateDispatch['d'] | undefined;

	public constructor(public options: KirishimaPlayerOptions, public kirishima: BaseKirishima, public node: KirishimaNode) {}

	public async connect() {
		await this.kirishima.options.send(this.options, createVoiceChannelJoinPayload(this.options));
		return this;
	}

	public async disconnect() {
		await this.kirishima.options.send(this.options, createVoiceChannelJoinPayload(this.options, true));
		return this;
	}

	public async setServerUpdate(packet: GatewayVoiceServerUpdateDispatch) {
		this.voiceServer = packet.d;
		if (!this.voiceState?.session_id) return;

		await this.node.ws.send({
			op: WebsocketOpEnum.VOICE_UPDATE,
			guildId: this.voiceServer.guild_id,
			sessionId: this.voiceState.session_id,
			event: this.voiceServer
		});
	}

	public setStateUpdate(packet: GatewayVoiceStateUpdateDispatch) {
		this.voiceState = packet.d;
	}
}
