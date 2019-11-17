using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Activation;
using RestWcf.Domain.Contracts;
using RestWcf.Domain.Entities;

namespace RestWcf.Domain.Services
{
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class Rest : IRest
    {
        private static List<TodoItem> Database;

        static Rest() { Database = new List<TodoItem>(); }

        #region POST
        public TodoItem Create(TodoItem todo)
        {
            todo.Id = Guid.NewGuid().ToString();

            Database.Add(todo);

            return todo;
        }
        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        public void CreateAllowCors() { }
        #endregion

        #region DELETE
        public void Delete(string[] ids)
        {
            Database.RemoveAll(i => ids.Contains(i.Id));
        }

        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        public void DeleteCors() { }
        #endregion

        #region GET
        public List<TodoItem> List()
        {
            return Database;
        }
        #endregion

        #region UPDATE
        public void Update(TodoItem todo)
        {
            Database = Database.Select(i => i.Id.Equals(todo.Id) ? todo : i).ToList();
        }

        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        public void UpdateAllowCors() { }

        public void UpdateBatch(List<TodoItem> todoList)
        {
            Database = Database.Select(i => todoList.FirstOrDefault(t => t.Id.Equals(i.Id)) ?? i).ToList();
        }

        /// <summary>
        ///  Fix CORS (preflight request: OPTIONS verb)
        /// </summary>
        public void UpdateBatchAllowCors() { }
        #endregion
    }
}