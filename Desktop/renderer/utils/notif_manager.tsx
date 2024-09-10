import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
// import { hashPassword } from './passwordencryptor';

const db_notifs = collection(database, 'notifications');

export class NotifUtils {

    static async getAllNotifUser(id:string){
        const q = query(db_notifs, where('staffId','==',id));
        const querySnapshot = await getDocs(q);
        let notifs = []

        querySnapshot.docs.map((doc) => {
            const n = {
                id : doc.id,
                ...doc.data()
            }
            notifs.push(n)
        })

        let staffs = []
        staffs.push(id)

        const q2 = query(db_notifs, where('staffId', 'array-contains-any', staffs));
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.docs.map((doc) => {
            const n = {
                id : doc.id,
                ...doc.data()
            }
            notifs.push(n)
        })

        // console.log(notifs)
        return notifs;
    }

    static async deleteNotif(id : string){
        const ref = doc(db_notifs, id);
        await deleteDoc(ref);
    }

    static async insertNotif(title:string, content:string, staffId:any){
        const notifRef = doc(db_notifs);
        const notifData = {
            title: title,
            content: content,
            staffId: staffId
        };
        await setDoc(notifRef, notifData);
    }

}

