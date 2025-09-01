export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).send("Only POST allowed");
  const {action,username,password,email,token,from,to,subject,body}=req.body;

  try{
    // Create account with valid domain
    if(action==="create"){
      // Get a valid domain from mail.tm
      const d=await fetch("https://api.mail.tm/domains");
      const domains=await d.json();
      const domain=domains["hydra:member"][0].domain;
      const address=username+"@"+domain;
      const r=await fetch("https://api.mail.tm/accounts",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({address, password})
      });
      const data=await r.json();
      return res.json(data);
    }

    // Login
    if(action==="login"){
      const r=await fetch("https://api.mail.tm/token",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({address:email,password})
      });
      const data=await r.json();
      return res.json(data);
    }

    // Send email
    if(action==="send"){
      if(!token) return res.status(401).send("Login first");
      const r=await fetch("https://api.mail.tm/messages",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${token}`
        },
        body:JSON.stringify({to:[{address:to}],subject,text:body})
      });
      const data=await r.json();
      return res.send("Email sent successfully!");
    }

    res.status(400).send("Unknown action");
  }catch(err){
    console.error(err);
    res.status(500).send(err.message||"Server error");
  }
}
