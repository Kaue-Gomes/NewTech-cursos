import {useState} from "react";
import {Link} from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import {validateEmail} from "../services/validation";

export default function ForgotPassword(){
 const [email,setEmail]=useState("");
 const [error,setError]=useState("");

 function handleSubmit(e){
  e.preventDefault();
  if(!validateEmail(email)){
   setError("Email inválido");
  }else{
   setError("");
   alert("Email de recuperação enviado 🚀");
  }
 }

 return(
  <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-blue-300">
   <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
    <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Recuperar senha</h2>

    <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} error={error}/>

    <Button>Enviar</Button>

    <div className="mt-4 text-center text-sm">
     <Link to="/" className="text-blue-600">Voltar para login</Link>
    </div>
   </form>
  </div>
 )
}