import { Kirishima } from './Kirishima';
import type { KirishimaPlayerOptions } from '../typings/index';
import type { KirishimaNode } from '../index';
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/gateway/v9';
import { WebsocketOpEnum } from 'lavalink-api-types';
import { KirishimaTrack } from './Track/KirishimaTrack';

export class KirishimaPlayer {
	public voiceServer: GatewayVoiceServerUpdateDispatch['d'] | undefined;
	public voiceState: GatewayVoiceStateUpdateDispatch['d'] | undefined;

	public constructor(public options: KirishimaPlayerOptions, public kirishima: Kirishima, public node: KirishimaNode) {}

	public async connect(): Promise<KirishimaPlayer> {
		await this.kirishima.options.send(this.options.guildId, Kirishima.createVoiceChannelPayload(this.options));
		return this;
	}

	public async disconnect(): Promise<KirishimaPlayer> {
		await this.kirishima.options.send(this.options.guildId, Kirishima.createVoiceChannelPayload(this.options, true));
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

	public async playTrack(track: KirishimaTrack | string, options?: { noReplace?: boolean; pause?: boolean; startTime?: number; endTime?: number }) {
		await this.node.ws.send({
			op: WebsocketOpEnum.PLAY,
			track: track instanceof KirishimaTrack ? track.track : track,
			guildId: this.options.guildId,
			noReplace: true,
			...options
		});
		return this;
	}
}
