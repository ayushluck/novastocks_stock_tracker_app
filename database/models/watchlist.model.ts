import { Document, Schema, models, model } from 'mongoose';

export interface WatchlistItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    addedAt: Date;
}

const watchlistSchema = new Schema<WatchlistItem>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        symbol: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        company: {
            type: String,
            required: true,
            trim: true,
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    }
);

watchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Watchlist = models.Watchlist || model<WatchlistItem>('Watchlist', watchlistSchema);
