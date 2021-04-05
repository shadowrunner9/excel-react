using System;
using System.Collections.Generic;

namespace reactdemo.Model
{
    public partial class VwEscalationText
    {
        public string Idcode { get; set; }
        public string SurveyStatus { get; set; }
        public DateTime? InterviewCompleteDate { get; set; }
        public string DesGenderAgeMatch { get; set; }
        public string LowPbreturnGroup { get; set; }
        public string Pbstatus { get; set; }
        public DateTime? PbDate { get; set; }
        public DateTime? CurrentTime { get; set; }
        public string DdInd { get; set; }
        public int? Ddiff { get; set; }
        public string EscalationRule { get; set; }
    }
}
