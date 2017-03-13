#!/bin/bash
################################################################################
#	Rectoverso Client
#	Script qui swap les axes de l'écran et qui lance le navigateur en 
#	mode plein écran avec des vrais morceaux de rectoverso dedans...
################################################################################
/usr/bin/xinput set-prop "Acer T231H" "Evdev Axis Inversion" 0 1
# Swaping Y axis and X
/usr/bin/xinput set-prop "Acer T231H" "Evdev Axes Swap" 1
/usr/bin/chromium-browser --kiosk http://urbanlab17-ZMI.local:5000/default/
