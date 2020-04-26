import { Rectangle } from '@pixi/math';
import { TileMerger } from './TileMerger';

/**
 * {@code GlyphTiles} is used to find free tiles in glyph-atlases that can be used to store a glyph.
 *
 * @ignore
 * @class
 */
export class GlyphTiles
{
    private rows: number;
    private columns: number;

    private tiles: boolean[];
    private _tileMerger: TileMerger;
    private filledPoints: number;

    constructor(rows: number, columns: number)
    {
        /**
         * The number of tile rows
         * @member {number}
         */
        this.rows = rows;

        /**
         * The number of tile columns
         * @member {number}
         */
        this.columns = columns;

        /**
         * A 2D boolean array tracking which tiles are "used"
         * @member {boolean[]}
         */
        this.tiles = new Array(rows * columns);

        for (let i = 0; i < this.tiles.length; i++)
        {
            this.tiles[i] = false;
        }

        /**
         * {@code TileMerger} for merging tiles into rectangles.
         * @member {PIXI.TileMerger}
         */
        this._tileMerger = new TileMerger(rows, columns);
        this.filledPoints = 0;
    }

    get filledLength(): number
    {
        return this.filledPoints;
    }

    getBlankTileRects(): Rectangle[]
    {
        return this._searchTileRects(0, 0, this.columns - 1, this.rows - 1, false);
    }

    private _searchTileRects(
        left: number, top: number, right: number, bottom: number, framesToBeRendered = true
    ): Rectangle[]
    {
        let frames = 0;

        this._tileMerger.load((gridArray) =>
        {
            const rowJump = this.columns - right + left - 1;

            for (let row = top, point = (row * this.columns) + left; row <= bottom; row++, point += rowJump)
            {
                for (let column = left; column <= right; column++, point++)
                {
                    if (!this.tiles[point])
                    {
                        gridArray[point] = true;
                        this.tiles[point] = framesToBeRendered;
                        ++frames;
                        ++this.filledPoints;
                    }
                }
            }
        });

        const tileRects = this._tileMerger.heal();

        if (tileRects.length > frames)
        {
            throw new Error('Can\'t split');
        }

        return tileRects;
    }
}
