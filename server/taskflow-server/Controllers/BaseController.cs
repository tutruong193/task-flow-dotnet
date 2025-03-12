using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace taskflow_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseController : ControllerBase
    {
    }
}
