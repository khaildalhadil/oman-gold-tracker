namespace GoldPriceTracker.Api.Models;

/// <summary>Price of one gram of gold of a given karat.</summary>
public class GoldPrice
{
    public int Karat { get; init; }

    public decimal PricePerGram { get; init; }

    public string Currency { get; init; } = "OMR";

    public DateTime UpdatedAt { get; init; }
}
