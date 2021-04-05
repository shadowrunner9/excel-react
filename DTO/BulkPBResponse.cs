using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using reactdemo.DTO;

namespace reactdemo.DTO
{
    public class BulkPBResponse
    {
        public string message { get; set; }

        public List<Excel_Id> ids { get; set; }
    }
}
