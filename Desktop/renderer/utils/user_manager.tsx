import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import React, {useState} from 'react';
import { User } from './AuthContext';
// import { hashPassword } from './passwordencryptor';

const db_users = collection(database, 'users');

export class UserUtils {

    static async getUser(uid:string){
        const q = query(db_users, where('uid','==',uid));
        const querySnapshot = await getDocs(q);
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return userData;

    }

    static toPascalCase(str) {
        const words = str.split(' ');
        const pascalCaseWords = words.map((word) => {
          const firstLetter = word.charAt(0).toUpperCase();
          const restOfWord = word.slice(1).toLowerCase();
          return firstLetter + restOfWord;
        });
        return pascalCaseWords.join('');
      }    

    static async getAllUser(){
        const promise = await getDocs(db_users);
        const users = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            shift: this.toPascalCase(doc.data().shiftId)
          }));
        return users;
    }

    static async getAllUserRole(role:string){
        const q = query(db_users, where('role','==',role));
        const promise = await getDocs(q);
        const users = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        return users;
    }

    static async insertUser(uid:string, name:string, email:string, password:string, role:string, shiftId:string){
        const userRef = doc(db_users, uid);
        const userData = {
        uid:uid,
        name: name,
        email: email,
        password: password,
        role : role,
        shiftId : shiftId
        };
        await setDoc(userRef, userData);
    }

    static async updateUser(user : any){
        const pDocRef = doc(db_users, user.uid);
        
        const pUpdate = {
            uid : user.uid,
            name : user.name,
            email : user.email,
            password : user.password,
            role : user.role,
            shiftId : user.shiftId
        }
        
        await updateDoc(pDocRef, pUpdate);
    }

    static async deleteUser(id){
        const userRef = doc(db_users, id);
        await deleteDoc(userRef);
    }
}

