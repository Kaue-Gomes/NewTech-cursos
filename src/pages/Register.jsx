import {useState} from "react";
import {Link} from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import {validateEmail,validatePassword} from "../services/validation";

export default function Register(){
 const [nome,setNome]=useState("");
 const [email,setEmail]=useState("");
 const [senha,setSenha]=useState("");
 const [errors,setErrors]=useState({});

 function handleSubmit(e){
  e.preventDefault();
  let newErrors={};

  if(nome.length < 3) newErrors.nome="Nome mínimo 3 caracteres";
  if(!validateEmail(email)) newErrors.email="Email inválido";
  if(!validatePassword(senha)) newErrors.senha="Senha mínima 6 caracteres";

  setErrors(newErrors);

  if(Object.keys(newErrors).length===0){
   alert("Cadastro realizado 🚀");
  }
 }

 return(
  <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-blue-300">
   <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
    <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Cadastro</h2>

    <Input label="Nome" value={nome} onChange={e=>setNome(e.target.value)} error={errors.nome}/>
    <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email}/>
    <Input label="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} error={errors.senha}/>

    <Button>Cadastrar</Button>

    <div className="mt-4 text-center text-sm">
     <Link to="/" className="text-blue-600">Voltar para login</Link>
    </div>
   </form>
  </div>
 )
}