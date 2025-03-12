namespace taskflow_server.Data.Interface
{
    public interface IDateTracking
    {
        DateTime Created_at { get; set; }

        DateTime? Updated_at { get; set; }
    }
}
