import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { UserUtils } from './user_manager';
import { NotifUtils } from './notif_manager';
import { PatientUtils } from './patient_manager';
// import { hashPassword } from './passwordencryptor';

const db_reports = collection(database, 'reports');

export class ReportUtils {

    static async getAllReportUser(role:string){
        const q = query(db_reports, where('division','==',role));
        const querySnapshot = await getDocs(q);
        let reports = []
        await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
        
            const staff = await UserUtils.getUser(data.staffId);
            const name = staff.name

            const patient = await PatientUtils.getPatient(data.patient)
            const pname = patient.name
        
            const n = {
              id: doc.id,
              staffName : name,
              patientName : pname,
              ...doc.data(),
              date : new Date(data.date.seconds * 1000).toLocaleString(),
            };
            reports.push(n);
          }));
        // console.log(reports)        
        return reports;
    }

    static async insertReport(report : any){
        const ReportRef = doc(db_reports);
        // console.log(report)
        const staffs = await UserUtils.getAllUserRole(report.division)
        // console.log(staffs)
        let id = []
        staffs.map((staff) => {
            id.push(staff.id)
        })
        // console.log(id)
        await NotifUtils.insertNotif("New Report in Your Division", report.problem, id)
        await setDoc(ReportRef, report);
    }

}

