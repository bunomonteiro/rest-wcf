using System.Runtime.Serialization;

namespace RestWcf.Domain.Entities
{
    [DataContract(Namespace = "")]
    public class TodoItem
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string Title { get; set; }
        [DataMember]
        public bool Completed { get; set; }
    }
}