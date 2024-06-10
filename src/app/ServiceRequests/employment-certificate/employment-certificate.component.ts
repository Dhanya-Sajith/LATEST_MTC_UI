import { Component, OnInit } from '@angular/core';
import { ApiCallService } from 'src/app/api-call.service';
import { LoginService } from 'src/app/login.service';
import { GeneralService } from 'src/app/general.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-employment-certificate',
  templateUrl: './employment-certificate.component.html',
  styleUrls: ['./employment-certificate.component.scss']
})
export class EmploymentCertificateComponent implements OnInit {
  userSession:any = this.session.getUserSession();
  empdata: any=this.general.getEmpdetails_competency(); 
  empcode: any=this.userSession.empcode;
  company:any= this.userSession.companycode;
  companydata: any=[];
  hostname!: string;
  experiencedata: any=[];
  employmentdata: any=[];

  constructor(private apicall:ApiCallService,private session:LoginService,private general:GeneralService) { }

  ngOnInit(): void {
    this.hostname=this.apicall.dotnetapi; 
    this.apicall.genCompanyData(this.company).subscribe((res)=>{
      this.companydata=res;
      //alert(JSON.stringify(this.companydata))
      
    })  

  //  this.apicall.Fetch_Employment_Cert_Template(this.empcode,1).subscribe((res)=>{
  //     this.employmentdata=res;
       //alert(JSON.stringify(this.employmentdata))
       this.apicall.Fetch_Employment_Cert_Template(this.empdata.empcode,this.empdata.reqid).subscribe((res)=>{
       this.employmentdata=res;
    })
    
  }
  // convertToPDF() {
  //   const element: HTMLElement = <HTMLDivElement>document.getElementById('htmlElementId'); // Replace with your HTML element's ID

  //   if (element) {
  //     html2canvas(element).then((canvas) => {

  //       //alert(canvas);

  //       const contentDataURL = canvas.toDataURL('image/jpeg');
  //       const pdf = new jsPDF('portrait', 'mm', 'a4'); // Portrait, millimeters, A4 size

  //       const imgWidth = 200;
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //       const xPosition = (pdf.internal.pageSize.width - imgWidth) / 2; // Center horizontally
  //       const yPosition = 10; // Center vertically

  //       // Draw a border around the entire page
  //       pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);

  //       // Add the image inside the bordered area
  //      // pdf.addImage(contentDataURL, 'JPG', xPosition, yPosition, imgWidth, imgHeight);
  //       pdf.addImage(contentDataURL, 'JPEG', xPosition, yPosition, imgWidth, imgHeight);

  //       pdf.save('Employment Certificate.pdf');
  //     }).catch((error) => {
  //       console.error('Error during html2canvas conversion:', error);
  //     });
  //   } else {
  //     console.error("Element with ID 'htmlElementId' not found");
  //   }
  // }
  convertToPDF() {
    const element = document.getElementById('htmlElementId'); // Replace with your HTML element's ID

    if (element) {
        html2canvas(element, { scale: 2 }).then((canvas) => {
            const contentDataURL = canvas.toDataURL('image/jpeg');
            const pdf = new jsPDF('portrait', 'mm', 'a4'); // Portrait, millimeters, A4 size

            const imgWidth = 200;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const xPosition = (pdf.internal.pageSize.width - imgWidth) / 2; // Center horizontally
            const yPosition = 10; // Top margin

            // Add the image to the PDF
            pdf.addImage(contentDataURL, 'JPEG', xPosition, yPosition, imgWidth, imgHeight);

            // Save the PDF
            pdf.save('Employment Certificate.pdf');
        }).catch((error) => {
            console.error('Error during html2canvas conversion:', error);
        });
    } else {
        console.error("Element with ID 'htmlElementId' not found");
    }
}

}

