import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/gateway/v9';
import { WebsocketOpEnum } from 'lavalink-api-types';
import { KirishimaPlayerOptions, Kirishima, KirishimaNode, createVoiceChannelJoinPayload } from '..';

export class BasePlayer {
	public voiceServer: GatewayVoiceServerUpdateDispatch['d'] | undefined;
	public voiceState: GatewayVoiceStateUpdateDispatch['d'] | undefined;

	public constructor(public options: KirishimaPlayerOptions, public kirishima: Kirishima, public node: KirishimaNode) {}

	public async connect(): Promise<BasePlayer> {
		await this.kirishima.options.send(this.options.guildId, createVoiceChannelJoinPayload(this.options));
		return this;
	}

	public async disconnect(): Promise<BasePlayer> {
		await this.kirishima.options.send(this.options.guildId, createVoiceChannelJoinPayload(this.options, true));
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
