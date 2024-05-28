import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiCallService } from 'src/app/api-call.service';
import { LoginService } from 'src/app/login.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-resignation-approval-hr',
  templateUrl: './resignation-approval-hr.component.html',
  styleUrls: ['./resignation-approval-hr.component.scss']
})
export class ResignationApprovalHRComponent implements OnInit {

  userSession:any = this.session.getUserSession();
  empcode: any=this.userSession.empcode;
  AddReqForm: FormGroup;
  companydata: any;
  selectedCompanyid: any=-1;
  selectedStatus: any=0;
  status: any;
  yeardata: any;
  tabledata: any;
  selectedYear: any=new Date().getFullYear();item: any;
  reason: any;
rejectReason: any;

  selectedCompanyidEOS: any=-1;
  deptdata: any;
  selectedDeptid: any='';
  selectedCompanyidAddReq: any='';
  empdata: any;
  selectedEmp: any='';
  selectedStatusEOS: any=-1;
  selectedYearEOS: any=-1;  
  showModal!: number;
  failed!: string;
  success!: string;
  releavingtype: any;
  selectedReleavingtype: any;
  workdate: any;
  date!: string | null;
  searchInput:string='';
  lastWorkingDay: any;
  isWithinTenDaysBefore!: boolean;
  itemsPerPage=10;
  currentPage=1;
  desiredPage: any; 
  

  constructor(private apicall:ApiCallService,private session:LoginService,private formBuilder: FormBuilder,private datePipe: DatePipe) { 
    this.AddReqForm = this.formBuilder.group({      
      selectedCompanyidAddReq: ['', Validators.required],
      selectedDeptid: ['', Validators.required],
      selectedEmp: ['', Validators.required],
      reason: ['', Validators.required],
      releavingType: ['', Validators.required], 
      remarks: ['', Validators.required], 
      date: ['', Validators.required], 
      checkbox:['', Validators.required],     
    });
  }

  ngOnInit(): void {
     //company combo box
     this.apicall.FetchCompanyList(this.empcode).subscribe((res) => {
      this.companydata=res;      
    });
    //Status 
    this.apicall.listCompany(26).subscribe((res)=>{
      this.status=res;
    })
    //Year
    this.apicall.listYear().subscribe((res) => {
      this.yeardata=res;      
    });
    //Releaving type
    this.apicall.listCompany(72).subscribe((res)=>{
      this.releavingtype=res;
    })

    this.filter(); 
  }
  onCompanySelected(selectedCompanyid: any) { 
    this.selectedCompanyid=selectedCompanyid;    
    }
    onCompanySelectedEOS(selectedCompanyid: any) { 
      this.selectedCompanyidEOS=selectedCompanyid;      
    }
    filter(){
      this.apicall.Fetch_OffboardingReq_HR(this.empcode,this.selectedStatus,this.selectedYear,this.selectedCompanyid).subscribe((res) => {
        this.tabledata=res; 
        this.lastWorkingDay=res[0]?.LAST_WORK_DATE; 
       
        console.log(JSON.stringify(this.tabledata))     
      }); 
     }
     selectedreq(item:any){
     this.item=item;
     this.reason=item.REASON;
     }
     editlastWorkDate(newDate: string, item: any) {   
      item.LAST_WORK_DATE = newDate;   
      console.log('New Last Work Date:', newDate);
    }
     onCompanySelectedAddReq() {
      this.selectedCompanyidAddReq=this.AddReqForm.get('selectedCompanyidAddReq')?.value;
      this.AddReqForm.get('selectedDeptid')?.setValue('');     
      this.AddReqForm.get('selectedEmp')?.setValue('');
      this.empdata=[];      
      this.apicall.FetchDepartmentList(this.selectedCompanyidAddReq,this.empcode).subscribe((res) => {
        this.deptdata=res; 
        //alert(JSON.stringify(this.deptdata))   
      }); 
      }
      onDeptSelected(){
         this.selectedDeptid=this.AddReqForm.get('selectedDeptid')?.value;
         this.AddReqForm.get('selectedEmp')?.setValue('');       
         this.apicall.FetchEmployee(this.selectedDeptid,this.selectedCompanyidAddReq,this.empcode).subscribe((res) => {
          this.empdata=res;
          //alert(JSON.stringify(this.empdata))      
          });  
        } 
        onEmpSelected(){
          this.selectedEmp=this.AddReqForm.get('selectedEmp')?.value;
          this.apicall.EmpLastWorkingDate(this.selectedEmp).subscribe((res) => {
            this.workdate=res.WORK_DATE;
            this.date=this.datePipe.transform(this.workdate, 'yyyy-MM-dd');            
            this.AddReqForm.get('date')?.setValue(this.date);
            //alert(this.date)      
          });  
        }
        AddRequest(){
          if (this.AddReqForm.valid) { 
            const data={
              updatedby: this.empcode,
              ...this.AddReqForm.value,        
          };
          console.log(JSON.stringify(data));
          this.apicall.AddTerminationReqByHR(data).subscribe((res) => {
            //alert(JSON.stringify(res));   
            if (res.Errorid == 1) {
              (<HTMLInputElement>document.getElementById("openModalButton")).click();
                this.showModal = 1;
                this.success = "Request added successfully!";                
            } else if (res.Errorid == -1) {
              (<HTMLInputElement>document.getElementById("openModalButton")).click();
                this.showModal = 2;
                this.failed = "An active request already exists!";
            }else{
              (<HTMLInputElement>document.getElementById("openModalButton")).click();
                this.showModal = 2;
                this.failed = "Failed!";
            } 
            //this.fetchRequests();
            this.CancelReq();       
        });
        }else{
          this.markFormGroupTouched(this.AddReqForm);
        }
      }
      private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
          control.markAsTouched();
          if (control instanceof FormGroup) {
            this.markFormGroupTouched(control);
          }
        });
      }   
      CancelReq(){
        this.AddReqForm.reset();
        this.AddReqForm.get('selectedCompanyidAddReq')?.setValue(''); 
        this.AddReqForm.get('selectedDeptid')?.setValue('');     
        this.AddReqForm.get('selectedEmp')?.setValue('');
        this.AddReqForm.get('releavingType')?.setValue(''); 
      }
      checkDate(data:any): boolean {
        const lastWorkingDate = new Date(data.LAST_WORK_DATE);
        const today = new Date();
      
        // Normalize the time part to 00:00:00 for the comparison
        this.normalizeDate(today);
        this.normalizeDate(lastWorkingDate);
      
        const tenDaysBefore = new Date(lastWorkingDate);
        tenDaysBefore.setDate(lastWorkingDate.getDate() - 10);
      
        // Check if today is within the range from tenDaysBefore to lastWorkingDate
        this.isWithinTenDaysBefore = today >= tenDaysBefore;
        return this.isWithinTenDaysBefore;
    }
    
      
      // Helper function to normalize the time part of a date to 00:00:00
      private normalizeDate(date: Date): void {
        date.setHours(0, 0, 0, 0);
      }
      Approve(item:any){       
        const data={
          req_id:item.REQUEST_ID,
          empcode:item.EMP_CODE,
          last_work_date:item.LAST_WORK_DATE,
          verified_by:this.empcode,
          verified_remarks:"",
          mflag:1
        };
        //alert(JSON.stringify(data));
        this.apicall.ApproveReject_Resignation(data).subscribe((res)=>{
          if (res.Errorid == 1) {
            (<HTMLInputElement>document.getElementById("openModalButton")).click();
              this.showModal = 1;
              this.success = "Request approved successfully!";              
            }else{
            (<HTMLInputElement>document.getElementById("openModalButton")).click();
              this.showModal = 2;
              this.failed = "Failed!";
          } 
          this.filter();  
         })
       }
       Reject(item:any){    
        const data={
          req_id:item.REQUEST_ID,
          empcode:item.EMP_CODE,
          last_work_date:item.LAST_WORK_DATE,
          verified_by:this.empcode,
          verified_remarks:this.rejectReason,
          mflag:2
        }
        
        this.apicall.ApproveReject_Resignation(data).subscribe((res)=>{
          if (res.Errorid == 1) {
            (<HTMLInputElement>document.getElementById("openModalButton")).click();
              this.showModal = 1;
              this.success = "Request rejected!";              
            }else{
            (<HTMLInputElement>document.getElementById("openModalButton")).click();
              this.showModal = 2;
              this.failed = "Failed!";
          } 
          this.filter();  
         })
       }
       cancelReqByHR(item:any){
        const Data = {
          empcode:item.EMP_CODE,
          reqid:item.REQUEST_ID,        
          updated_by:this.empcode,
          Sflag:10,
        };  
        this.apicall.CancelRequest_HR(Data).subscribe((res)=>{
          if(res.Errorid==1){
            (<HTMLInputElement>document.getElementById("openModalButton")).click();
            this.showModal = 1;
            this.success = "Request Cancelled!";
           }
           else{
            (<HTMLInputElement>document.getElementById("openModalButton")).click();
            this.showModal = 2;
            this.failed = "Failed!";
           }        
          
          this.filter();  
         })  
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
      const totalResults = this.tabledata.filter((policy: any) => {
        return Object.values(policy).some((value: any) =>
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
      
      const filteredData = this.tabledata.filter((policy: any) =>
        Object.values(policy).some((value: any) =>
          typeof value === 'string' &&
          value.toLowerCase().startsWith(this.searchInput.toLowerCase())
        )
      );
    
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      return Math.min(start, filteredData.length);
    }
    
    
    getEntriesEnd(): number {  
      const filteredData = this.tabledata.filter((policy: any) =>
        Object.values(policy).some((value: any) =>
          typeof value === 'string' &&
          value.toLowerCase().startsWith(this.searchInput.toLowerCase())
        )
      );
      const end = this.currentPage * this.itemsPerPage;
      return Math.min(end, filteredData.length);
    }
}
