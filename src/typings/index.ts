import { Awaitable } from '@sapphire/utilities';
import type { GatewayOpcodes } from 'discord-api-types/gateway/v9';
import type { KirishimaNode } from '../Structures/KirishimaNode';
import type { KirishimaPlayer } from '../Structures/KirishimaPlayer';
import type { KirishimaTrack } from '../Structures/Track/KirishimaTrack';
import type { KirishimaPartialTrack } from '../Structures/Track/KirishimaPartialTrack';

export interface KirishimaOptions {
	clientId?: string;
	clientName?: string;
	nodes: KirishimaNodeOptions[];
	send(guildId: string, payload: payload): Awaitable<unknown>;
	/** @description customize-able player handler, allow you to set it to collection or even redis. */
	player?: PlayerOptionHook;
}

export interface PlayerOptionHook {
	(guildId: string, options: KirishimaPlayerOptions, node: KirishimaNode): Awaitable<KirishimaPlayer>;
}

export interface payload {
	op: GatewayOpcodes;
	d: {
		guild_id: string;
		channel_id: string | null;
		self_deaf: boolean;
		self_mute: boolean;
	};
}

export interface KirishimaPlayerOptions {
	guildId: string;
	shardId?: string;
	channelId?: string;
	voiceId: string;
	selfDeaf?: boolean;
	selfMute?: boolean;
}

export interface KirishimaNodeOptions {
	identifier?: string;
	url: string;
	secure?: boolean;
	password?: string;
}

export interface Extendable {
	KirishimaNode: typeof KirishimaNode;
	KirishimaPlayer: typeof KirishimaPlayer;
	KirishimaTrack: typeof KirishimaTrack;
	KirishimaPartialTrack: typeof KirishimaPartialTrack;
}
