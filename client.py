import requests
import os.path as op
import os
import time

nick = ""
file_path = ""
code = ""
base_url = "http://syntasso-syntasso.apps.us-west-1.starter.openshift-online.com"

while True:
    nick = input("Enter your nick: ")

    if nick.__contains__(" "):
        print("Sorry nick can't contain spaces")
        continue


    try:

        URL = base_url + "/startuser"

        r = requests.get(URL, {"nick": nick})

        # print(r.json())

        if r.json()['status'] == "available":
            print("Your nick: ", nick)
            break
        else:
            print("Sorry, this nick is already taken :-( ......try another!")


    except Exception as exce:
        print(exce)


while True:

    file_path = input("Enter file path: ")

    try:

        code_file = open(file_path, "r")
        code = code_file.read()

        break

    except Exception as exce:
        print(exce)

print()
print("open url: "+ base_url + "/" + nick)
print("!!!!====----Minimise this terminal window and continue ur work----====!!!!")
print()



def sendCode(code_now):

    try:

        URL = base_url + "/codeupdate"

        r = requests.post(URL, {"nick" : nick, "code" : code_now})

        if(r.text == "success"):
            print("code updated with nick ", nick)

    except Exception as exce:
        print(exce)




sendCode(code)
time_old = os.path.getmtime(file_path)

while True:

    new_time = os.path.getmtime(file_path)

    time.sleep(0.5)

    if new_time > time_old:
        time_old = new_time
        code_file = open(file_path, "r")
        sendCode(code_file.read())
