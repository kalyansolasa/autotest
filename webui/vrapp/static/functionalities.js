/*------------Searching Function-----------------*/
        $(document).ready(function(){ 
            $("#search").keyup(function() {
                var value = this.value;      
                $("table").find("tr").each(function(index) {  
                    if (index === 0) return;
                    var id = $(this).find("td").first().text();
                    $(this).toggle(id.indexOf(value) !== -1);
                });
            });
        });

/*------------Puppet Start-----------------*/
			$(function(){
				$("#start").click(function(){
					document.getElementById("start").disabled = true;
					$.get("/puppetrun", {cn:contest_name}, function(data){
						$("#output").html("Puppet started with process id " + data);
						 document.getElementById("start").disabled = true;
        				 document.getElementById("stop").disabled = false;
					});
				});
			});

/*------------Puppet Stop-----------------*/    
function testStop() {
        document.getElementById("stop").disabled = true;
        document.getElementById("start").disabled = false;
        $("#output").html("Puppet stoped");
    }

/*------------checking difficulty level-----------------*/

$(function(){
var checkEvent = function () {
	res={easy:0,medium:0,hard:0}
	$(".checkList input:checked").each(function(index,el) {
		var dl = $(el).attr('difficulty-level');
		res[dl]+=1;
	});
	$("#output #easy").html(res['easy']);
	$("#output #medium").html(res['medium']);
	$("#output #hard").html(res['hard']);
 }
 
$(".checkList input").on('change',checkEvent);
});

$(function(){
	$("#easy1").blur(function () {
		var n = $("#easy1").val();
   		var m = $("#easy").text();
	     if(parseInt(n) > parseInt(m)) {
        	alert("Value must be less than the Selected Questions");
        	 $("#easy1").val("0");
   			 }
	});
		$("#medium1").blur(function () {
		var n = $("#medium1").val();
   		var m = $("#medium").text();
	     if(parseInt(n) > parseInt(m)) {
        	alert("Value must be less than the Selected Questions");
        	 $("#medium1").val("0");
   			 }
	});
		$("#hard1").blur(function () {
		var n = $("#hard1").val();
   		var m = $("#hard").text();
	     if(parseInt(n) > parseInt(m)) {
        	alert("Value must be less than the Selected Questions");
        	 $("#hard1").val("0");        	
   			 }
	});
});

/*------------Question Paper Creation-----------------*/
			$(function(){	
				$("#questionForm").submit(function(event){
				event.preventDefault();
				data=[];
				checkBoxes = document.getElementsByName('cq');
				for(i=0;i<checkBoxes.length;i++) {
					if(checkBoxes[i].checked) {
						data.push(checkBoxes[i].value);
					}
				}
				console.log(data);
				flagsvalues = document.getElementsByName('ps');
				flag=[];
				for(i=0;i<flagsvalues.length;i++) {
					if(flagsvalues[i].checked) {
						flag.push(flagsvalues[i].value);
					}
				}
				console.log(flag);
				var easy = $("#easy1").val();
				var medium = $("#medium1").val();
				var hard = $("#hard1").val();
			    	$.get("/createquestionpaper", {names:JSON.stringify(data) , flags:JSON.stringify(flag) , easy:easy , medium:medium , hard:hard}, function(data){
						alert("Test paper Generated With Your seleted Questions \n Thank You!!\nQuestions Are "+data);
						window.location.reload(true);
					});
				});
			});
				
/*------------Checking UserName For Unique-----------------*/
			$(function(){
				$("#username").blur(function(){
					var contestname = $("#contestname").val();
					var username = $("#username").val();
					console.log(contestname);
					console.log(username);
					var letters = /^[A-Za-z0-9]+$/;
					if( letters.test(username) )
					{
					$.get("/checkUserName",{'username':username,'contestname':contestname},function(data){
					 console.log(data);
					 if(data == "InValid")
					  {
					     alert("UserName Already Exists Please Try Another One");	
					     //window.location.reload(true);
					     $("#username").val("");
					     
					  }
				   	});
					}
					else
					{
					alert('Please input alphabet characters only');
					//window.location.reload(true);
					$("#username").val("");
					}
				});
			});
			
/*------------Checking Contestname For Unique-----------------*/
			$(function(){
				$("#contest").blur(function(){
					var contestname = $("#contest").val();
					console.log(contestname);
					 $.get("/checkContestName",{'contestname':contestname},function(data){
					 console.log(data);
					if(data == "InValid")
					  {
					     alert("Contest Name Already Exists Please Try Another One");
					     //window.location.reload(true);
					     $("#contest").val("");
					  }
				   });
				});
			});

/*------------Adding Contest-----------------*/
function add()
 {
    document.getElementById("addingpage").style.visibility="visible";
 }
 
 /*------------participant approver selection-----------------*/
			$(function(){	
				$("#approvecontestantForm").submit(function(event){
				unames = document.getElementsByName('contestants');
				event.preventDefault();
				data=[];
				for(i=0;i<unames.length;i++) {
					if(unames[i].checked) {
						data.push(unames[i].value);
					}
				}
			    console.log(data);
			    $.get("/approve",{names:JSON.stringify(data)},function(msg){
			     if(msg == "Valid")
					  {
					     window.location.reload(true);
					  }
				   });
				});
			});
 
/*-----------------Checking Password and email-------------*/
	$(function(){	
			  $("#email").blur(function(event){
			  var e = $("#email").val();
			  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  				if( !emailReg.test( e ) ) {
    				alert("Not a Valid Email");
  				}
			 });
				$("#cpass").blur(function(event){
				var p = $("#pass").val();
				var cp=$("#cpass").val();
				if(p != cp)
					{
						alert("Password Didn't Match");
						$("#cpass").val("");
						$("#pass").val("");  
					}
			     });
			});

		
