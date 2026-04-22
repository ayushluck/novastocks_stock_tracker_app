const WatchlistPage = () => {
    return (
        <section className="min-h-screen py-6">
            <h1 className="text-3xl font-semibold text-white">Watchlist</h1>
            <p className="mt-2 text-gray-400">
                Track your saved symbols and monitor price action in one place.
            </p>

            <div className="mt-8 rounded-xl border border-gray-800 bg-gray-800 p-6">
                <p className="text-gray-300">No watchlist items yet.</p>
                <p className="mt-2 text-sm text-gray-500">
                    Add symbols from search to start building your watchlist.
                </p>
            </div>
        </section>
    )
}

export default WatchlistPage
