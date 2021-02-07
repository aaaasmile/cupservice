#!/bin/bash
read -p "Update the cup-invido (cup-invido on invido.it) y/n ? " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]
then
	echo "Update canceled."
	exit 0

fi
echo "Stop the service"
sudo systemctl stop cup-invido

ZIPDIR="./zips"
CURRDIR="./current"
OLDDIR="./old"

echo "Now starting the process..."

# Make sure dir exits
[ ! -d "$ZIPDIR" ] && mkdir -p "$ZIPDIR"
[ ! -d "$CURRDIR" ] && mkdir -p "$CURRDIR" 
[ ! -d "$OLDDIR" ] && mkdir -p "$OLDDIR" 

# backup the current dir
bckdir=$OLDDIR'/'"$(date +"%Y-%m-%d-%H%M%S")"
echo "Backup dir is: $bckdir"
[ ! -d "$bckdir" ] && mkdir -p "$bckdir" 

mv $CURRDIR'/static'  $bckdir
mv $CURRDIR'/templates'  $bckdir
mv $CURRDIR'/config.toml'  $bckdir
mv $CURRDIR'/cupservice.bin'  $bckdir

#zips=$(ls $ZIPDIR)
#echo "$zips"

for file in $ZIPDIR/*.zip ; do 
	fname=$(basename "$file")
	#echo "Name is $fname"
done

echo "Want to unzip $fname"
zippath=$ZIPDIR'/'$fname
destpath=$CURRDIR'/'
echo "The source is $zippath and destination is $destpath"
unzip $zippath -d $destpath

chmod +x $destpath'/'cupservice.bin

echo "Start the service"
sudo systemctl start cup-invido


echo "That's all folks!"
