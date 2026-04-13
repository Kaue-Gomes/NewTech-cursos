export default function Input({label,error,...props}){
 return(
  <div className="mb-4">
   {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
   <input {...props} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"/>
   {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
 )
}