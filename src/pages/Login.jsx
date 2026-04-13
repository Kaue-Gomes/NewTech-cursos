import {useState} from "react";
import {Link} from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import {validateEmail,validatePassword} from "../services/validation";

export default function Login(){
 const [email,setEmail]=useState("");
 const [senha,setSenha]=useState("");
 const [errors,setErrors]=useState({});

 function handleSubmit(e){
  e.preventDefault();
  let newErrors={};
  if(!validateEmail(email)) newErrors.email="Email inválido";
  if(!validatePassword(senha)) newErrors.senha="Senha mínima 6 caracteres";
  setErrors(newErrors);

  if(Object.keys(newErrors).length===0){
   alert("Login válido 🚀");
  }
 }

 return(
  <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-blue-300">
   <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
    <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Entrar</h2>

    <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email}/>
    <Input label="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} error={errors.senha}/>

    <Button>Entrar</Button>

    <div className="flex justify-between mt-4 text-sm">
     <Link to="/register" className="text-blue-600">Criar conta</Link>
     <Link to="/forgot-password" className="text-blue-600">Esqueci senha</Link>
    </div>
   </form>
  </div>
 )
}