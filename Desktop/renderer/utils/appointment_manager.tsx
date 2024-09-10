import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { UserUtils } from './user_manager';
import { NotifUtils } from './notif_manager';
import { JobUtils } from './job_manager';
import { PatientUtils } from './patient_manager';
// import { hashPassword } from './passwordencryptor';

const db_appointment = collection(database, 'appointments');

export class AppointmentUtils {

    static async getAllAppointment(){
        const promise = await getDocs(db_appointment);
        const appointments = await Promise.all(
            promise.docs.map(async (doc) => {
              const data = doc.data()
              const date = new Date(data.date.seconds * 1000).toLocaleString()

              const doctor = await UserUtils.getUser(data.doctor)
              const patient = await PatientUtils.getPatient(data.patient)
        
              return {
                id: doc.id,
                ...data,
                doctorN : doctor.name,
                patientN : patient.name,
                date : data.date,
                dateFormatted: date,
                category : data.category,
                status : data.status
              };
            })
          );

        let lastUrgentQueueNumber = 0;
        const u = appointments
        .filter((a) => a.category === 'Urgent' && a.status === "Queued")
        .sort((a, b) => a.date - b.date)
        .map((appointment, index) => {
            lastUrgentQueueNumber += 1;
            return { ...appointment, queueNumber: lastUrgentQueueNumber };
        });
        
        let lastNormalQueueNumber = lastUrgentQueueNumber;
        const n = appointments
        .filter((a) => a.category === 'Normal' && a.status === "Queued")
        .sort((a, b) => a.date - b.date)
        .map((appointment, index) => {
            lastNormalQueueNumber += 1;
            return { ...appointment, queueNumber: lastNormalQueueNumber };
        });

        const skipped = appointments
        .filter((a) => a.status === "Skipped")
        .sort((a, b) => a.date - b.date)
        .map((appointment, index) => {
            return { ...appointment};
        });

        const completed = appointments
        .filter((a) => a.status === "Completed")
        .sort((a, b) => a.date - b.date)
        .map((appointment, index) => {
            return { ...appointment};
        });

        const progress = appointments
        .filter((a) => a.status === "In Progress")
        .sort((a, b) => a.date - b.date)
        .map((appointment, index) => {
            return { ...appointment};
        });
        
        const sortedAppointments = [...progress,...u, ...n, ...completed, ...skipped];
        
        // console.log(sortedAppointments)
        return sortedAppointments;
    }

    static async getAppointmentByRoomBed(room : any, bed: any){
        const q = query(
            db_appointment,
            where("room", "==", room),
            where("bed", "==", bed),
            where("status", "==", "Used")
          );
        const querySnapshot = await getDocs(q);
        let Appointment = null

        querySnapshot.docs.map((doc) => {
            const n = {
                id : doc.id,
                ...doc.data()
            }
            Appointment = n
        })
        console.log(Appointment)
        return Appointment
    }

    static async insertAppointment(appointment : any){
        const appointmentRef = doc(db_appointment);
        appointment.job = null
        await setDoc(appointmentRef, appointment);
    }

    static async getAppointment(id : any){
        const aDocRef = doc(db_appointment, id);
        const aDocSnapshot = await getDoc(aDocRef);

        return aDocSnapshot.data();
        
    }

    static async getAppointmentByJob(id : any){
        try{
            const q = query(
                db_appointment,
                where("job", "==", id),
              );
            const querySnapshot = await getDocs(q);
            let Appointment = null
    
            querySnapshot.docs.map((doc) => {
                const n = {
                    id : doc.id,
                    ...doc.data()
                }
                Appointment = n
            })
            console.log(Appointment)
            return Appointment
        }
        catch (err) {
            console.error(err)
        }
        
    }

    static async updateAppointment(appointment : any){
        const pDocRef = doc(db_appointment, appointment.id);
        
        const staffs = []
        staffs.push(appointment.doctor)

        const time = []
        time.push(Timestamp.fromDate(new Date()))
        let id = null
        if(appointment.status === 'In Progress'){
            id = await JobUtils.insertAppointmentJob("Appointing Patient", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)) , "doctor", appointment.patient, appointment.room, appointment.bed, staffs, time)
            appointment.job = id
        }else if(appointment.status === 'Completed'){
            await JobUtils.completeJob(appointment.job)
        }

        await updateDoc(pDocRef, appointment);
    }

    static async updateResult(appointment: any){
        const pDocRef = doc(db_appointment, appointment.id);
        
        const a = await this.getAppointment(appointment.id)
        a.symptoms = appointment.symptoms
        a.diagnosis = appointment.diagnosis
        
        await updateDoc(pDocRef, a);
    }

    static async updateStatus(appointment : any, status : string){
        const pDocRef = doc(db_appointment, appointment.id);
        
        const a = await this.getAppointment(appointment.id)
        a.status = status
        await updateDoc(pDocRef, a);
    }

    static async deleteAppointment(appointment : any){
        const appointmentRef = doc(db_appointment, appointment.id);
        await deleteDoc(appointmentRef);
    }

}

