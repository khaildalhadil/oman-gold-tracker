using GoldPriceTracker.Api.Models;
using GoldPriceTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoldPriceTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoldPricesController(GoldPriceService service) : ControllerBase
{
    /// <summary>All prices, or only one karat with ?karat=22.</summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<GoldPrice>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<IEnumerable<GoldPrice>> GetAll([FromQuery] int? karat)
    {
        if (karat is null)
        {
            return Ok(service.GetAll());
        }

        var price = service.GetByKarat(karat.Value);
        return price is null ? KaratNotFound(karat.Value) : Ok(new[] { price });
    }

    /// <summary>Price of one karat, e.g. /api/goldprices/22.</summary>
    [HttpGet("{karat:int}")]
    [ProducesResponseType<GoldPrice>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<GoldPrice> GetByKarat(int karat)
    {
        var price = service.GetByKarat(karat);
        return price is null ? KaratNotFound(karat) : Ok(price);
    }

    private NotFoundObjectResult KaratNotFound(int karat) =>
        NotFound(new { message = $"No price for karat {karat}. Available: 24, 22, 21, 18." });
}
