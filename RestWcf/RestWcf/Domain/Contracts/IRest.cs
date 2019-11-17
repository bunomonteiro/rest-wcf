using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using RestWcf.Domain.Entities;

namespace RestWcf.Domain.Contracts
{
    [ServiceContract(Namespace = "")]
    public interface IRest
    {
        #region POST
        [OperationContract, WebInvoke(
            Method = "POST",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.WrappedRequest,
            UriTemplate = "Create"
        )]
        TodoItem Create(TodoItem todo);

        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        [OperationContract, WebInvoke(Method = "OPTIONS", UriTemplate = "Create")]
        void CreateAllowCors();
        #endregion

        #region GET
        [OperationContract, WebInvoke(
            Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.WrappedRequest,
            UriTemplate = "List"
        )]
        List<TodoItem> List();
        #endregion

        #region UPDATE
        [OperationContract, WebInvoke(
            Method = "PUT",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.WrappedRequest,
            UriTemplate = "Update"
        )]
        void Update(TodoItem todo);

        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        [OperationContract, WebInvoke(Method = "OPTIONS", UriTemplate = "Update")]
        void UpdateAllowCors();

        [OperationContract, WebInvoke(
            Method = "PUT",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.WrappedRequest,
            UriTemplate = "UpdateBatch"
        )]
        void UpdateBatch(List<TodoItem> todoList);

        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        [OperationContract, WebInvoke(Method = "OPTIONS", UriTemplate = "UpdateBatch")]
        void UpdateBatchAllowCors();
        #endregion

        #region DELETE
        [OperationContract, WebInvoke(
            Method = "DELETE",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.WrappedRequest,
            UriTemplate = "Delete"
        )]
        void Delete(string[] ids);

        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        [OperationContract, WebInvoke(Method = "OPTIONS", UriTemplate = "Delete")]
        void DeleteCors();
        #endregion
    }
}
