import { Component, OnInit } from '@angular/core';
import { ApiCallService } from 'src/app/api-call.service';
import { LoginService } from 'src/app/login.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bonus-payout-history-report',
  templateUrl: './bonus-payout-history-report.component.html',
  styleUrls: ['./bonus-payout-history-report.component.scss']
})
export class BonusPayoutHistoryReportComponent implements OnInit {
  userSession:any = this.session.getUserSession();
  empcode: any=this.userSession.empcode;  
  authorityflg:any =this.userSession.authorityflg;
  companycode:any=this.userSession.companycode;

  searchInput: string='';
  itemsPerPage=10;
  currentPage=1;   
  listCompany: any;
  company: any;
  tabledata: any;   
  yearlist: any;  
  fromyear: any=-1;
  toyear: any=-1;  
  bonusYears!: string[];
  desiredPage: any;
  showModal: any;
  failed: any;
 

  constructor(private session:LoginService,private apicall:ApiCallService,private datePipe: DatePipe) { }

  ngOnInit(): void {    
    //Company list
    this.apicall.FetchCompanyList(this.empcode).subscribe((res)=>{
      this.company=res;
    });
    //Year list
    this.apicall.listYear().subscribe((res)=>{
      this.yearlist=res;
    }); 
  }     
  
  filter(){ 
     
    this.apicall.GetBonusHistoryReportData(this.companycode,this.fromyear,this.toyear).subscribe((res)=>{
      this.tabledata=res;
      console.log(JSON.stringify(this.tabledata))
      if (this.tabledata.length > 0) {
        const bonusByYear = this.tabledata[0].BonusByYear;
        this.bonusYears = Object.keys(bonusByYear);
      }
    });
  }  
download_to_excel()
  { 
   let Excelname:any;
   this.apicall.ExportToExcelBonusHistoryReport(this.tabledata).subscribe((res)=>{
    Excelname=res.Errormsg;
    let fileurl=this.apicall.GetExcelFile(Excelname);
    let link = document.createElement("a");
      
        if (link.download !== undefined) {
       //   let url = URL.createObjectURL(blob);
          link.setAttribute("href", fileurl);
          link.setAttribute("download", "ReportFile.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
   }
  });
  
  }
  getTotalPages(): number {
    return Math.ceil(this.totalSearchResults / this.itemsPerPage);
  }
  
  goToPage() {
    const totalPages = Math.ceil(this.totalSearchResults / this.itemsPerPage);
    if (this.desiredPage >= 1 && this.desiredPage <= totalPages) {
      this.currentPage = this.desiredPage;
    } else {  
      
      (<HTMLInputElement>document.getElementById("openModalButton")).click();
      this.showModal = 2; 
      this.failed='Invalid page number!'; 
      this.desiredPage=''; 
    }   
   
  }
  getPageNumbers(currentPage: number): number[] {
    const totalPages = Math.ceil(this.totalSearchResults / this.itemsPerPage);
    const maxPageNumbers = 5; // Number of page numbers to show
    const middlePage = Math.ceil(maxPageNumbers / 2);
    let startPage = Math.max(currentPage - middlePage, 1);
    let endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);
  
    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(endPage - maxPageNumbers + 1, 1);
    }
  
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
  
// Function to Calculate the total number of search results
get totalSearchResults(): number {
  const totalResults = this.tabledata.filter((employee: any) => {
    return Object.values(employee).some((value: any) =>
      typeof value === 'string' && value.toLowerCase().startsWith(this.searchInput.toLowerCase())
    );
  }).length;

  const maxPageFiltered = Math.ceil(totalResults / this.itemsPerPage);  

  if (this.currentPage > maxPageFiltered) {
    this.currentPage = 1; 
  }

  return totalResults;
}

// Function to change the current page
  changePage(page: number): void { 
    this.desiredPage = '';   
    this.currentPage = page;
    const maxPage = Math.ceil(this.totalSearchResults / this.itemsPerPage);
    if (this.currentPage > maxPage) {
      this.currentPage = 1;
    }        
  }
getEntriesStart(): number {
  if (this.currentPage === 1) {
    return 1;
  }
  
  const filteredData = this.tabledata.filter((employee: any) =>
    Object.values(employee).some((value: any) =>
      typeof value === 'string' &&
      value.toLowerCase().startsWith(this.searchInput.toLowerCase())
    )
  );

  const start = (this.currentPage - 1) * this.itemsPerPage + 1;
  return Math.min(start, filteredData.length);
}


getEntriesEnd(): number {  
  const filteredData = this.tabledata.filter((employee: any) =>
    Object.values(employee).some((value: any) =>
      typeof value === 'string' &&
      value.toLowerCase().startsWith(this.searchInput.toLowerCase())
    )
  );
  const end = this.currentPage * this.itemsPerPage;
  return Math.min(end, filteredData.length);
}


  
}


