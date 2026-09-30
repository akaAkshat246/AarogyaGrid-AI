import React,{createContext,useContext,useEffect,useState} from 'react';
const AuthContext=createContext(null);
const USERS_KEY='aarogyagrid_users';
const SESSION_KEY='aarogyagrid_session';
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem(SESSION_KEY)||'null'));
 useEffect(()=>{user?localStorage.setItem(SESSION_KEY,JSON.stringify(user)):localStorage.removeItem(SESSION_KEY)},[user]);
 const signup=(name,email,password)=>{const users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');if(users.some(u=>u.email.toLowerCase()===email.toLowerCase())) throw Error('An account with this email already exists.');const u={name,email,password};users.push(u);localStorage.setItem(USERS_KEY,JSON.stringify(users));setUser({name,email,mode:'account'});};
 const login=(email,password)=>{const users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase()&&x.password===password);if(!u) throw Error('Invalid email or password. Try Sign Up or use Demo Website.');setUser({name:u.name,email:u.email,mode:'account'});};
 const demo=()=>setUser({name:'Demo Admin',email:'demo@aarogyagrid.ai',mode:'demo'});
 const logout=()=>setUser(null);
 return <AuthContext.Provider value={{user,signup,login,demo,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
