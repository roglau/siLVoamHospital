import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { UserUtils } from './user_manager';
import { NotifUtils } from './notif_manager';
import { JobUtils } from './job_manager';
// import { hashPassword } from './passwordencryptor';

const db_certificates = collection(database, 'certificates');

export class CertifUtils {

    static async getAllCertif(){
        const promise = await getDocs(db_certificates);
        const certifs = await Promise.all(
            promise.docs.map(async (doc) => {
              const data = doc.data()
              const date = new Date(data.createdDate.seconds * 1000).toLocaleString()
        
              return {
                id: doc.id,
                ...data,
                createdDate: date
              };
            })
          );

        return certifs;
    }

    static async insertCertif(certif : any){
        const certifRef = doc(db_certificates);
        const lastDoc = await JobUtils.getLastDoctor(certif.patient)
        // console.log(lastDoc)
          
        certif.staffs = lastDoc
        await NotifUtils.insertNotif("New Certificate Created", "New certificate need your approval" , certif.staffs)
        await setDoc(certifRef, certif);
    }

    static async getCertif(id:string){
      const certifDocRef = doc(db_certificates, id);
      const certifDocSnapshot = await getDoc(certifDocRef);

      return certifDocSnapshot.data();
  }

    static async approveCertif(id : any, fileName : string){
      const c = await this.getCertif(id)
      
      c.status = 'Approved'
      c.signature = fileName

      const certifDocRef = doc(db_certificates, id);
      await updateDoc(certifDocRef, c);
    }

}

