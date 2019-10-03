#!/bin/sh
### BEGIN INIT INFO
# Provides:          rectoverso_2_demarrage.sh
# Required-Start:    
# Required-Stop:     
# Default-Start:     2 3 4 5
# Default-Stop:      0 6
# Description:      lance l'appli rectoverso
### END INIT INFO


# Handle rotated display
handleRotatedScreen.sh "Acer T231H" "0, 1" "1" &&

# Launch game in chromium kiosk mode
chromium-browser --kiosk http://urbanlab17-zmi.local:5000/default
