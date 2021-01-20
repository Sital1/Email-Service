document.addEventListener('DOMContentLoaded', async function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

 function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // get the form and make a post request
  document.querySelector('#compose-form').addEventListener('submit',(event)=>{
    event.preventDefault()
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => 
      response.json()
    )
    .then(result => {
        // Print result

          if(result.error)
          {
            msg.style.color = "red"
            msg.innerHTML = ""
            msg.innerHTML = result.error
          }else{
            msg.innerHTML = ""
            load_mailbox('sent')
            
          }
          
        }
    )
  })
  return false
}

async function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

async function getMail()
{
  try{
    const res = await fetch(`/emails/${mailbox}`)
    const data = await res.json()
    
    return data
  }
  catch(e)
  {
    console.error(e)
  }
}

const data = await getMail()



function display(mailbox)
{
  if(data.length != 0)
{
  const element = document.querySelector('#emails-view')

  for (let i =0; i<data.length;i++)
  {
    const mail = document.createElement('div')
    mail.style.margin = "10px"
    mail.style.border = "thin solid black"
    mail.style.minHeight = "45px"
    mail.style.borderRadius = "10px"
    mail.style.padding = "10px"
    
    mail.addEventListener('mouseover',()=>{
      mail.style.cursor = "pointer"
    })

    if(data[i].read === true)
    {
      mail.style.backgroundColor = "#DCDCDC"
    }

    const body = document.createElement('p')  
    body.innerHTML = data[i].body.slice(0,100) + data[i].timestamp
  
    if(mailbox === "inbox"){
      const from = document.createElement('strong')
      from.innerHTML =  `<strong>From:${data[i].sender}|</strong>&nbsp;&nbsp;${data[i].body}|&nbsp;&nbsp;${data[i].timestamp}`
      mail.appendChild(from)
    }
    else if
    (mailbox==="sent"){
      const to = document.createElement('div')
      to.innerHTML =  `<strong>TO:${data[i].recipients}|</strong>&nbsp;${data[i].body}|&nbsp;&nbsp;${data[i].timestamp}`
      mail.appendChild(to)   
    }
 
    else if(mailbox === "archive")
    {
      if(data[i].archived === true)
      {
      const from = document.createElement('strong')
      from.innerHTML =  `<strong>From:${data[i].sender}|</strong>&nbsp;${data[i].body}|&nbsp;&nbsp;${data[i].timestamp}`
      mail.appendChild(from)
    }
  }
  mail.addEventListener('click',()=>{
    show_mail(data[i].id,mailbox)
  })
    element.append(mail)
    

  }

} 
else{
  document.querySelector('#emails-view').innerHTML = `<h4>Nothing</h4>`;
}

}

function show_mail(id,mailbox)
{
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector("#emails-view").innerHTML = "";
    let mail = document.createElement('div')
    mail.innerHTML = `
    Sender : ${email.sender} <br>
    Recipients : ${email.recipients}<br>
    Subject : ${email.subject}<br>
    Time : ${email.timestamp}<br>
    <br> ${email.body}<br>
    ` 
    document.querySelector("#emails-view").appendChild(mail);
    if (mailbox == 'sent') return;
    let archive = document.createElement("btn");
      archive.className = `btn btn-outline-info my-2`;
      archive.addEventListener("click", () => {
        toggle_archive(id, email.archived);
        if (archive.innerText == "Archive") archive.innerText = "Unarchive";
        else archive.innerText = "Archive";
      });
      if (!email.archived) archive.textContent = "Archive";
      else archive.textContent = "Unarchive";
      document.querySelector("#emails-view").appendChild(archive);

      let reply = document.createElement("btn");
      reply.className = `btn btn-outline-success m-2`;
      reply.textContent = "Reply";
      reply.addEventListener("click", () => {
        reply_mail(email.sender, email.subject, email.body, email.timestamp);
      });
      document.querySelector("#emails-view").appendChild(reply);
      make_read(id);

  })
}

function toggle_archive(id, state) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
}

function make_read(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

  function reply_mail(sender, subject, body, timestamp) {
  compose_email();
  if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  const pre_fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;

  document.querySelector("#compose-body").value = pre_fill;
}

display(mailbox)

}
