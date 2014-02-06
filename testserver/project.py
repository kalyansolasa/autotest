import subprocess
import os
import conf
from conf import participant_dir
import xml.etree.ElementTree as ET
import mailer
import time
from pymongo import MongoClient


def listofParticipants():
    dirs1 = os.listdir(conf.participant_dir)
    for user in dirs1:
        direct=participant_dir + user + '/'
        previous={}
        for y in os.listdir(direct):
            if os.path.isdir(direct+'/'+y) and y[0] !='.':
                previous[y] = subprocess.check_output(['/usr/bin/git',
                                                 'log','-1',
                                                 '--oneline',y],
                                                cwd=direct)
        subprocess.call(['/usr/bin/git', 'pull'], cwd=direct)

        for y in os.listdir(direct):
            if os.path.isdir(direct+'/'+y) and y[0] !='.':
                after = subprocess.check_output(['/usr/bin/git',
                                                 'log','-1',
                                                 '--oneline',y],
                                                cwd=direct)
                if y not in previous or previous[y] != after:
                    yield user,y
        
  
    
def inputoutput(progname):
    tree = ET.parse(conf.program_dir+progname+".xml")
    root=tree.getroot()
    for test in root:
        if test.tag != 'test':
            continue
        input_str=test.find('input').text
        output_str=test.find('output').text
        description=test.find('description').text
        yield input_str,output_str,description 
        
def mainloop():
    client = MongoClient()
    db = client.test
    col_submissions=db.submissions
    col_scores=db.scores
    result={}
    mailer.load_address()
    
    for user,programname in listofParticipants():
        if user not in result:
            result[user]=[]
        program_dir=conf.participant_dir+user+'/'+programname
        program_name=conf.program_dir+programname+'.xml'
        
        if not os.path.isfile(program_name): 
            result[user].append('The program *%s* is INVALID' % programname)
            result[user].append('-----------------------------------------------')
            continue            
                   
        with file('compilation error.txt','w') as fp:
            ret=subprocess.call(['/bin/bash','compile.sh'],cwd=program_dir,
                            stderr=fp,
                            stdout=fp)
        if ret!=0:
            with file('compilation error.txt','r') as fp:
                error=fp.read()
                print error
                result[user].append('program *%s* [COMPILATION FAILED]' % programname)
                result[user].append(error)
                print "compilation failed"
            continue
        
        p_pass=[]
        p_fail=[]
        p_error=[]
                        
        for input_i,output_o,description_d in inputoutput(programname):
            run_cmd = ['/bin/bash','run.sh']
            run_cmd.extend(input_i.split(' '))
            try:
                with file('run_exception.txt','w') as fp:
                    cmd_op = subprocess.check_output(run_cmd,cwd=program_dir,stderr=fp)
                cmd_op=cmd_op.strip()
                
                if cmd_op == output_o:
                    print cmd_op, output_o
                    p_pass.append('%s %s [successful]' %(description_d, programname))
                else:
                    print cmd_op,output_o
                    p_fail.append('%s %s [failed]' %(description_d, programname))
            except:
                with file('run_exception.txt','r') as fp:
                    err=fp.read()
                    p_error.append('%s %s [error]' %(description_d, programname))
                    p_error.append(err)
        tree = ET.parse(program_name)
        root=tree.getroot()
        program_score=int(root.find("score").text)

        if len(p_pass) == 0:
            result[user].append('program *%s* [FAIL]' % programname)
            progstatus = 'FAIL'
            your_score = 0
        elif len(p_fail)+len(p_error)==0:
            result[user].append('program *%s* [SUCCESSFUL]' % programname)
            progstatus = 'SUCCESSFUL'
            your_score = program_score
        else:
            result[user].append('program *%s* [PARTIALLY SUCCESSFUL]' % programname)
            progstatus = 'PARTIALLY SUCCESSFUL'
            partial = root.find('partial')
            if partial and partial.text == 'true':
                your_score = (program_score * len(p_pass)) / (len(p_pass) + len(p_fail) + len(p_error))
            else:
                your_score = 0
    
        result[user].extend(p_pass)
        result[user].extend(p_fail)
        result[user].extend(p_error)
       
        submission = {"user_name":user,
                   "program":programname,
                   "program_result":progstatus,
                   "test_case_result":[p_pass,p_fail,p_error],
                   "time":time.time()
                   }
        print "==> Saving submission record in the DB <=="
        col_submissions.save(submission)
        
        if your_score:
            current_score = col_scores.find_one({'user_name':user})
            if not current_score:
                current_score = {
                    'user_name': user,
                    'programs': {}
                }
            current_score['programs'][programname] = {
                    'status': progstatus,
                    'score': your_score
            }
            col_scores.save(current_score)
        
    for user in result:
        subject = "Result of latest submission for %s. " % user
        content = "\n".join(result[user])
        mailer.feedbackmail(user,subject, content)


if __name__ == '__main__':
    while True:
        start_time=time.time()
        mainloop()
        exec_time = time.time()-start_time
        print exec_time
        
        if exec_time > 10:
            pass
        else:
            time.sleep(10-exec_time)
