import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
// import { hashPassword } from './passwordencryptor';

const db_requests = collection(database, 'requests');

export class RequestUtils {

    static async getAllRequest(){
        const promise = await getDocs(db_requests);
        const requests = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        return requests;
    }

    static async deleteReq(uid : string){
        const userRef = doc(db_requests, uid);
        await deleteDoc(userRef);
    }

}

