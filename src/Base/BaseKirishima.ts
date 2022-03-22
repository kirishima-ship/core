/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Collection from '@discordjs/collection';
import EventEmitter from 'node:events';
import { KirishimaPlayer, KirishimaPlayerOptions } from '..';
import { KirishimaNode } from '../Structures/KirishimaNode';
import { Structure } from '../Structures/Structure';
import { KirishimaPartialTrack } from '../Structures/Track/KirishimaPartialTrack';
import { KirishimaTrack } from '../Structures/Track/KirishimaTrack';
import { KirishimaOptions, LoadTrackResponse } from '../typings';

export class BaseKirishima extends EventEmitter {
	public nodes: Collection<string, KirishimaNode> = new Collection();
	public players?: Collection<string, KirishimaPlayer>;
	public constructor(public options: KirishimaOptions) {
		super();

		if (typeof options.send !== 'function') throw Error('Send function must be present and must be a function.');

		if (
			typeof options.spawnPlayer !== 'function' ||
			(typeof options.spawnPlayer === undefined && (typeof options.fetchPlayer !== 'function' || typeof options.fetchPlayer === undefined))
		) {
			this.players = new Collection();
			options.spawnPlayer = this.defaultSpawnPlayerHandler.bind(this);
		}

		if (
			typeof options.fetchPlayer !== 'function' ||
			(typeof options.fetchPlayer === undefined && (typeof options.spawnPlayer !== 'function' || typeof options.spawnPlayer === undefined))
		) {
			options.fetchPlayer = this.defaultFetchPlayerHandler.bind(this);
		}

		if (!options.nodes.length) throw new Error('Nodes option must not a empty array');
	}

	public resolveNode(identifierOrGroup?: string) {
		const resolveIdenfitierNode = this.nodes.filter((x) => x.connected).find((x) => x.options.identifier === identifierOrGroup);
		if (resolveIdenfitierNode) return resolveIdenfitierNode;
		const resolveGroupedNode = this.nodes.filter((x) => x.connected).find((x) => x.options.group?.includes(identifierOrGroup!)!);
		if (resolveGroupedNode) return resolveGroupedNode;
		return this.resolveBestNode().first();
	}

	public resolveBestNode() {
		return this.nodes
			.filter((x) => x.connected)
			.sort((x, y) => {
				const XLoad = x.stats?.cpu ? (x.stats.cpu.systemLoad / x.stats.cpu.cores) * 100 : 0;
				const YLoad = y.stats?.cpu ? (y.stats.cpu.systemLoad / y.stats.cpu.cores) * 100 : 0;
				return XLoad - YLoad;
			});
	}

	public async resolveTracks(
		options: string | { source?: string | undefined; query: string },
		node?: KirishimaNode
	): Promise<LoadTrackResponse<KirishimaTrack | KirishimaPartialTrack>> {
		node ??= this.resolveNode();
		const resolveTracks = await node!.rest.loadTracks(options);
		if (resolveTracks?.tracks.length) resolveTracks.tracks = resolveTracks.tracks.map((x) => new (Structure.get('KirishimaTrack'))(x));
		return resolveTracks as unknown as LoadTrackResponse<KirishimaTrack | KirishimaPartialTrack>;
	}

	private defaultSpawnPlayerHandler(guildId: string, options: KirishimaPlayerOptions, node: KirishimaNode) {
		const player = this.players!.has(guildId);
		if (player) return this.players!.get(guildId)!;
		const kirishimaPlayer = new (Structure.get('KirishimaPlayer'))(options, this, node);
		this.players!.set(guildId, kirishimaPlayer);
		return kirishimaPlayer;
	}

	private defaultFetchPlayerHandler(guildId: string) {
		return this.players!.get(guildId);
	}
}
