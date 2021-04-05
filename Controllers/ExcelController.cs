using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Data.SqlClient;
using reactdemo.Model;
using ExcelDataReader;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using reactdemo.DTO;

namespace reactdemo.Controllers
{
    [Authorize]
    public class ExcelController : Controller
    {
        const string SessionKeyFile = "_File";
        const string SessionKeyCount = "_CountFails";
//        private uFMSContext _context;
//        DataAccessLayer objdispo = new DataAccessLayer();
        public ExcelController()//uFMSContext context)
        {
 //           _context = context;
        }



        [HttpGet]
        [Route("/api/Excel/Index")]
        // Default GET method
        public IEnumerable<Excel_Id> Get()
        {
            var user = HttpContext.User?.Identity?.Name ?? "N/A";
            List<Excel_Id> ids = new List<Excel_Id>();
            var fileName = "./W823_Log.xlsx";
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            using (var stream = System.IO.File.Open(fileName, System.IO.FileMode.Open, System.IO.FileAccess.Read))
            {
                using (var reader = ExcelReaderFactory.CreateReader(stream, new ExcelReaderConfiguration()))
                {
                    reader.Read();  //skip header

                    while (reader.Read())   //Each row
                    {
                        if( reader.GetValue(0) != null )
                        {
                            ids.Add(new Excel_Id{
                                Date = reader.GetValue(0).ToString(),
                                OnlineId = reader.GetValue(1).ToString()
                            });
                        }
                    }
                }
            }
            return ids.ToList();
        }

        [HttpPost]
        //[Authorize(Roles = "Admins")]
        [Route("/api/Excel/load")]
        public BulkPBResponse PostFile([FromForm] FileModel filemod)
        {
            Console.WriteLine( "POST!" );
            BulkPBResponse response = new BulkPBResponse();
            HttpContext.Session.SetInt32(SessionKeyCount, -1);

            //            Console.WriteLine(file.FormFile.ToString());
            // delete existing xlsx/csv files in path


            var fileName = filemod.FileName;   

            string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", fileName);
            string[] del_files = Directory.GetFiles(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "*.xlsx,*.csv");
            foreach (string filePath in del_files)
            {
                System.IO.File.Delete(filePath);
            }

            try{
                using(Stream river = new FileStream(path, FileMode.Create))
                {
                    Console.WriteLine( filemod.FormFile.ToString() );
                    filemod.FormFile.CopyTo(river);
                }   
            }
            catch(Exception exc){
                //                return StatusCode(StatusCodes.Status500InternalServerError);
                response.message = "Error uploading file to server";
                return response;
            }
            List<Excel_Id> ids = new List<Excel_Id>();
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            using (var stream = System.IO.File.Open(path, System.IO.FileMode.Open, System.IO.FileAccess.Read))
//            using (StreamReader stream = new StreamReader(HttpContext.Request.Body))
            {
                IExcelDataReader reader;
                try{
                    if( System.IO.Path.GetExtension(path).ToLower().Equals(".csv"))
                        reader = ExcelReaderFactory.CreateCsvReader(stream, new ExcelReaderConfiguration());
                    else
                        reader = ExcelReaderFactory.CreateReader(stream, new ExcelReaderConfiguration());
                
                    Console.WriteLine( reader.RowCount );
                    Console.WriteLine( reader.FieldCount );
                    reader.Read();  //skip header

                    while (reader.Read())   //Each row
                    {
                        if( reader.GetValue(0) != null )
                        {
                            ids.Add(new Excel_Id{
                                Date = reader.GetValue(0).ToString(),
                                OnlineId = reader.GetValue(1).ToString()
                            });
                        }
                    }
                    reader.Dispose();
                }
                finally{
                //    reader.Dispose();
                }
                
            }
            List<string> sort_mrids = ids.Select(Excel_Id => Excel_Id.OnlineId).ToList();
            sort_mrids.Sort();
            IEnumerable<Excel_Id> results = ids;
            // query info from DB using Ids from sheet
            try{
//            var db_view = _context.VwEscalationText.Where(vw => sort_mrids.Contains(vw.Idcode)).ToList();
            // join query results into output

/*            results = ids.Join(db_view, Excel_Id => Excel_Id.OnlineId, VwEscalationText => VwEscalationText.Idcode,
                    (Excel_Id, VwEscalationText) => new Excel_Id{
                        Date = Excel_Id.Date,
                        OnlineId = Excel_Id.OnlineId,
                        SurveyStatus = VwEscalationText.SurveyStatus,
                        InterviewCompleteDate = VwEscalationText.InterviewCompleteDate,
                        PbDate = VwEscalationText.PbDate,
                        EscalationRule = VwEscalationText.EscalationRule
                    }).ToList();
*/            }
            catch(Exception exc)
            {
                Console.WriteLine( "Error pulling IDs from view" );
                response.message = "Error pulling IDs from view";
                return response;
            }

            int failing_count = 0;
            for( int i=0; i < results.Count(); i++)
            {
                if( results.ElementAt(i).Pbstatus != null )
                {
                    results.ElementAt(i).PassFail = "Fail - Existing PB Status";
                    failing_count++;
                }
                if(results.ElementAt(i).InterviewCompleteDate == null)
                {
                    results.ElementAt(i).PassFail = "Fail - Interview not Complete";
                    failing_count++;
                }
                // if code not exist

            }


            HttpContext.Session.SetString(SessionKeyFile, path);
            HttpContext.Session.SetInt32(SessionKeyCount, failing_count);
            response.ids = results.ToList();
            response.message = "Found data for "+results.ToList().Count+" IDs.  There are "+ failing_count+" failing issues.";

            return response;
        }

        [HttpPost]
        [Route("/api/Excel/process")]
        public BulkPBResponse ProcessFile([FromForm] FileModel file)
        {
            BulkPBResponse response = new BulkPBResponse();

            Console.WriteLine( "Process!" );
            var user = HttpContext.User?.Identity?.Name ?? "N/A";
            List<Excel_Id> ids = new List<Excel_Id>();
            var fileName = "./W823_Log.xlsx";
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            using (var stream = System.IO.File.Open(fileName, System.IO.FileMode.Open, System.IO.FileAccess.Read))
            {
                using (var reader = ExcelReaderFactory.CreateReader(stream, new ExcelReaderConfiguration()))
                {
                    reader.Read();  //skip header

                    while (reader.Read())   //Each row
                    {
                        if( reader.GetValue(0) != null )
                        {
                            ids.Add(new Excel_Id{
                                Date = reader.GetValue(0).ToString(),
                                OnlineId = reader.GetValue(1).ToString(),
                                EscalationRule = "Wave 1b",
                                PassFail = "Pass"
                            });
                        }
                    }
                }
            }
            response.ids = ids.ToList();
            response.message = "Found data for " + ids.ToList().Count + " IDs.  There are " + 0 + " failing issues.";
            return response;
//            return View(ids);     _context.Pbdisposition.ToList();
        }

    }
}