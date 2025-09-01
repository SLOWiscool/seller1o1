export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).send("Only POST allowed");
  const {action}=req.body;

  async function safeParse(resp){
    try {
      const text = await resp.text();
      return text ? JSON.parse(text) : {};
    } catch(e){
      return { error:"Failed to parse response" };
    }
  }

  try{
    if(action==="create-random"){
      // Random username
      const username="user"+Math.floor(Math.random()*100000);
      const password="pass1234";

      // Create account (no domain specified, mail.tm chooses)
      const r=await fetch("https://api.mail.tm/accounts",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({address:username,password})
      });
      const account = await safeParse(r);

      // If API auto-assigned domain, take it from response
      let address = account.address;
      if(!account.id){
        // fallback: retry without username only
        const fr = await fetch("https://api.mail.tm/accounts",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({address:username+"@mail.tm",password})
        });
        const fallback = await safeParse(fr);
        if(!fallback.id) return res.status(500).json({error:"Account creation failed",details:fallback});
        address = fallback.address;
      }

      // Login
      const l = await fetch("https://api.mail.tm/token",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({address,password})
      });
      const token = await safeParse(l);
      if(!token.token) return res.status(500).json({error:"Login failed",details:token});

      return res.json({token:token.token,email:address});
    }

    res.status(400).json({error:"Unknown action"});
  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
}
