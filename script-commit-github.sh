commitMessage=$1

git rm --cached -r .
git remote rm origin
git init
git add *
git config --global user.email "cexposit@ull.edu.es"
git config --global user.name "cexposit"
git commit -m "${commitMessage}"
git remote add origin git://github.com/KaizTen/kaizten-realtime-js.git
git push -u origin master --force
