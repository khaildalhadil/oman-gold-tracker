using GoldPriceTracker.Api.Models;

namespace GoldPriceTracker.Api.Services;

/// <summary>Serves gold prices from an in-memory list (sample prices, no database).</summary>
public class GoldPriceService
{
    private readonly List<GoldPrice> _prices;

    public GoldPriceService()
    {
        var updatedAt = DateTime.UtcNow;
        _prices =
        [
            new GoldPrice { Karat = 24, PricePerGram = 50.950m, UpdatedAt = updatedAt },
            new GoldPrice { Karat = 22, PricePerGram = 46.720m, UpdatedAt = updatedAt },
            new GoldPrice { Karat = 21, PricePerGram = 44.630m, UpdatedAt = updatedAt },
            new GoldPrice { Karat = 18, PricePerGram = 38.250m, UpdatedAt = updatedAt },
        ];
    }

    public IReadOnlyList<GoldPrice> GetAll() => _prices;

    public GoldPrice? GetByKarat(int karat) => _prices.FirstOrDefault(p => p.Karat == karat);
}
