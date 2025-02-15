<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ Import Namespace="System.Net" %> 
<%@ Import Namespace="System.Net.Mail" %> 
<script language="c#" runat="server">
private void btnSend_Click(object sender, System.EventArgs e)
{           

        MailMessage m = new MailMessage();
        SmtpClient sc = new SmtpClient();
        //Attachment att = new Attachment("/includes/img/galeria.jpg");
        //LinkedResource res = new LinkedResource("D:\\no_downSG.jpg");


        m.From = new MailAddress(txtFrom.Text);               
        m.To.Add(txtTo.Text);
        m.Subject = "This is a test";
        m.Body = "This is a sample message <b>using SMTP</b> <h1>authentication"; 
        m.IsBodyHtml = true;
        //m.Attachments.Add(res);

        sc.Host = txtMailServer.Text;
        string str1="gmail.com";
        string str2=txtFrom.Text.ToLower();

        if (str2.Contains(str1))
        {
            try
            {
                sc.Port = 587;
                sc.Credentials = new System.Net.NetworkCredential(txtFrom.Text,txtPass.Text);                       
                sc.EnableSsl = true;
                sc.Send(m);
                Response.Write("Email Send successfully");
            }
            catch (Exception ex)
            {
                Response.Write ("<BR><BR>* Please double check the From Address and Password to confirm that both of them are correct. <br>");
				Response.Write ("<BR><BR>If you are using gmail smtp to send email for the first time, please refer to this KB to setup your gmail account: http://www.smarterasp.net/support/kb/a1546/send-email-from-gmail-with-smtp-authentication-but-got-5_5_1-authentication-required-error.aspx?KBSearchID=137388");
				Response.End();
				throw ex;
			}
		}
	    else
		{
		try
            {
                sc.Port = 25;
                sc.Credentials = new System.Net.NetworkCredential(txtFrom.Text,txtPass.Text);                       
                sc.EnableSsl = false;
                sc.Send(m);
                Response.Write("Email Send successfully");
            }
            catch (Exception ex)
            {
                Response.Write ("<BR><BR>* Please double check the From Address and Password to confirm that both of them are correct. <br>");
				Response.End();
				throw ex;
            }
		}		                                     
}
</script> 
<html>
<body>
<table align = center>
    <TR> <TD align = center colspan = 2><h3>Email From ASP.NET(c#)</h3></tr>
    <form id="MailForm" method="post" runat="server" target="_blank">
    <TR>    
        <TD> <asp:Label ID="Label1" runat="server">From Email Address:</asp:Label>
        <TD> <asp:TextBox ID="txtFrom" runat="server"></asp:TextBox>        
    </TR>	
    <TR>    
        <TD><asp:Label ID="lblPass" runat="server">Email Password:</asp:Label>
        <TD><asp:TextBox ID="txtPass" runat="server" TextMode="Password" ></asp:TextBox>        
    </TR>
    <TR>	
        <TD> <asp:Label ID="EmailServer" runat="server">Email Server:</asp:Label>
	<TD> <asp:TextBox ID="txtMailServer" runat="server"></asp:TextBox>    
        <TD> <font color = blue>[For Example :: Mail.YourDomain.com] </font><font color=red>(make sure your domain resolves to our mail server.) </font>
   	</TR>
  <TD>     <asp:Label ID="Label2"  runat="server">Recipient Email Address: 
        </asp:Label>
    <TD>    <asp:TextBox ID="txtTo" runat="server"></asp:TextBox>					</TR>      
        <TR><TD align = center><asp:Button ID="btnSend" runat="server"
            Text="Send" OnClick="btnSend_Click"></asp:Button>				</TR>
    <TR> <TD colspan = 2> <asp:Label ID="lblStatus" runat="server" forecolor=Green Font-Size="15" Bold = true> 
        </asp:Label>
    </form>
</body>
</html>