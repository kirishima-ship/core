import { Awaitable } from '@sapphire/utilities';
import type { GatewayOpcodes } from 'discord-api-types/gateway/v9';
import type { KirishimaNode } from '../Structures/KirishimaNode';
import type { KirishimaPlayer } from '../Structures/KirishimaPlayer';
import type { KirishimaTrack } from '../Structures/Track/KirishimaTrack';
import type { KirishimaPartialTrack } from '../Structures/Track/KirishimaPartialTrack';
import { KirishimaFilter } from '../Structures/KirishimaFilter';
import { KirishimaPlugin } from '../Structures/KirishimaPlugin';

export interface KirishimaOptions {
	clientId?: string;
	clientName?: string;
	nodes: KirishimaNodeOptions[];
	node?: {
		resumeKey?: string;
		resumeTimeout?: number;
		reconnectOnDisconnect?: boolean;
		reconnectInterval?: number;
		reconnectAttempts?: number;
	};
	send(guildId: string, payload: payload): Awaitable<unknown>;
	/** @description customize-able spawn-player handler, allow you to set it to collection or even redis. */
	spawnPlayer?: SpawnPlayerOptionHook;
	/** @description Used for getting global player, most likely used when `VOICE_SERVER_UPDATE` and `VOICE_SERVER_UPDATE` emits. */
	fetchPlayer?: PlayerOptionHook;
	plugins?: KirishimaPlugin[];
}

export interface SpawnPlayerOptionHook {
	(guildId: string, options: KirishimaPlayerOptions, node: KirishimaNode): Awaitable<KirishimaPlayer>;
}

export interface PlayerOptionHook {
	(guildId: string): Awaitable<KirishimaPlayer | undefined>;
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
	group?: string[];
}

export interface Extendable {
	KirishimaNode: typeof KirishimaNode;
	KirishimaPlayer: typeof KirishimaPlayer;
	KirishimaTrack: typeof KirishimaTrack;
	KirishimaPartialTrack: typeof KirishimaPartialTrack;
	KirishimaFilter: typeof KirishimaFilter;
}
