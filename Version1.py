import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from rclpy.executors import MultiThreadedExecutor
from rclpy import clock
import time

# Print instructions for the user
msg = """
Reading from the keyboard  and Publishing to Twist!
---------------------------
Moving around:
   u    i    o
   j    k    l
   m    ,    .
For Holonomic mode (strafing), hold down the shift key:
---------------------------
   U    I    O
   J    K    L
   M    <    >
t : up (+z)
b : down (-z)
anything else : stop
q/z : increase/decrease max speeds by 10%
w/x : increase/decrease only linear speed by 10%
e/c : increase/decrease only angular speed by 10%
CTRL-C to quit
"""
# Define key bindings for moving the robot
moveBindings = {
        'i':(1,0,0,0),
        'o':(1,0,0,-1),
        'j':(0,0,0,1),
        'l':(0,0,0,-1),
        'u':(1,0,0,1),
        ',':(-1,0,0,0),
        '.':(-1,0,0,1),
        'm':(-1,0,0,-1),
        'O':(1,-1,0,0),
        'I':(1,0,0,0),
        'J':(0,1,0,0),
        'L':(0,-1,0,0),
        'U':(1,1,0,0),
        '<':(-1,0,0,0),
        '>':(-1,-1,0,0),
        'M':(-1,1,0,0),
        't':(0,0,1,0),
        'b':(0,0,-1,0),
    }
# Define key bindings for adjusting the robot's speed
speedBindings={
        'q':(1.1,1.1),
        'z':(.9,.9),
        'w':(1.1,1),
        'x':(.9,1),
        'e':(1,1.1),
        'c':(1,.9),
    }

class PublishThread(Node):

    def __init__(self, rate, robot_ip, port):
        super().__init__('publish_thread')
        self.publisher_client = self.create_publisher(Twist, 'cmd_vel', robot_ip, port)
          # Initialize variables for linear and angular velocity
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0
        self.th = 0.0
        self.speed = 0.0
        self.turn = 0.0
        self.done = False
        self.executor = MultiThreadedExecutor()
        # Set timeout to None if rate is 0 (causes new_message to wait forever
        # for new data to publish)
        if rate != 0.0:
            self.timeout = 1.0 / rate
        else:
            self.timeout = None

    def update(self, x, y, z, th, speed, turn):
        self.x = x
        self.y = y
        self.z = z
        self.th = th
        self.speed = speed
        self.turn = turn

    def stop(self):
        self.done = True
        self.update(0, 0, 0, 0, 0, 0)

    def publisher_callback(self):
        msg = Twist()
        msg.linear.x = self.speed*math.cos(self.th)
        msg.linear.y = self.speed*math.sin(self.th)
        msg.linear.z = self.z
        msg.angular.x = 0
        msg.angular.y = 0
        msg.angular.z = self.turn
        self.publisher_client.publish(msg)


def getKey(settings, timeout):
    if sys.platform == 'win32':
        # getwch() returns a string on Windows
        key = input()
    else:
        tty.setraw(sys.stdin.fileno())
        # sys.stdin.read() returns a string on Linux
        
        time.sleep(timeout)
        key = input()
    return key

def vels(speed, turn):
    return "currently:\tspeed %s\tturn %s " % (speed,turn)

def saveTerminalSettings():
    return None

def restoreTerminalSettings(old_settings):
    return None

if __name__=="__main__":
    settings = restoreTerminalSettings(settings)

    rclpy.init()
    pub_thread = PublishThread(rate=10)
    executor = rclpy.executors.MultiThreadedExecutor()
    executor.add_node(pub_thread)
    try:
        executor.spin_forever()
    finally:
        del pub_thread
        rclpy.spin_once(node, timeout_sec=0.1)
    node = TeleopTwistKeyboard()

    speed = node.get_parameter("speed").value
    turn = node.get_parameter("turn").value
    speed_limit = node.get_parameter("speed_limit").value
    turn_limit = node.get_parameter("turn_limit").value
    repeat = node.get_parameter("repeat_rate").value
    key_timeout = node.get_parameter("key_timeout").value
    stamped = node.get_parameter("stamped").value
    twist_frame = node.get_parameter("frame_id").value
    if stamped:

        pub_thread = PublishThread(repeat)

        x = 0
        y = 0
        z = 0
        th = 0
        status = 0

    try:
        pub_thread.wait_for_subscribers()
        pub_thread.update(x, y, z, th, speed, turn)

        print(msg)
        print(vels(speed,turn))
        while(1):
            key = getKey(settings, key_timeout)
            if key in moveBindings.keys():
                x = moveBindings[key][0]
                y = moveBindings[key][1]
                z = moveBindings[key][2]
                th = moveBindings[key][3]
            elif key in speedBindings.keys():
                speed = min(speed_limit, speed * speedBindings[key][0])
                turn = min(turn_limit, turn * speedBindings[key][1])
                if speed == speed_limit:
                    print("Linear speed limit reached!")
                if turn == turn_limit:
                    print("Angular speed limit reached!")
                print(vels(speed,turn))
                if (status == 14):
                    print(msg)
                status = (status + 1) % 15
            else:
                # Skip updating cmd_vel if key timeout and robot already
                # stopped.
                if key == '' and x == 0 and y == 0 and z == 0 and th == 0:
                    continue
                x = 0
                y = 0
                z = 0
                th = 0
                if (key == '\x03'):
                    break

            pub_thread.update(x, y, z, th, speed, turn)

    except Exception as e:
        print(e)

    finally:
        pub_thread.stop()
        restoreTerminalSettings(settings)
        del node
        rclpy.spin_once(node, timeout_sec=0.1)