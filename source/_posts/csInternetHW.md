---
title: csInternetHW
date: 2026-01-13 16:44:45
tags:
---

## 步骤1：基础网络配置

![69661ae56b018.png](https://bu.dusays.com/2026/01/13/69661ae56b018.png)

### R1702 配置

```sh
<H3C>sys
System View: return to User View with Ctrl+Z.
[H3C]int g0/1
[H3C-GigabitEthernet0/1]ip address 202.100.17.2 24
[H3C-GigabitEthernet0/1]quit
[H3C]int g0/0
[H3C-GigabitEthernet0/0]ip address 17.2.20.1 30
[H3C-GigabitEthernet0/0]quit
[H3C]int g5/1
[H3C-GigabitEthernet5/1]ip address 17.2.10.1 24
[H3C-GigabitEthernet5/1]quit
[H3C]sysn R_1702
[R_1702]save
The current configuration will be written to the device. Are you sure? [Y/N]:y
Please input the file name(*.cfg)[flash:/startup.cfg]
(To leave the existing filename unchanged, press the enter key):
Validating file. Please wait...
Configuration is saved to device successfully.

[R_1702]dis int bri
Brief information on interfaces in route mode:
Interface            Link Protocol Primary IP      Description
GE0/0                UP   UP       17.2.20.1
GE0/1                UP   UP       202.100.17.2
GE5/1                UP   UP       17.2.10.1
InLoop0              UP   UP(s)    --
NULL0                UP   UP(s)    --
REG0                 UP   --       --
... (其他接口 DOWN 省略) ...
```

### Core_1702 配置

```sh
<H3C>sys
System View: return to User View with Ctrl+Z.
[H3C]sysn Core_1702
[Core_1702]int g1/0/48
[Core_1702-GigabitEthernet1/0/48]port link-mode route
The configuration of the interface will be restored to the default. Continue? [Y/N]:y
%Jan 13 16:54:40:993 2026 Core_1702 IFNET/5/LINK_UPDOWN: Line protocol state on the interface GigabitEthernet1/0/48 changed to up.
[Core_1702-GigabitEthernet1/0/48]quit
[Core_1702]int m0/0/0
[Core_1702-M-GigabitEthernet0/0/0]ip address 17.2.10.2 24
[Core_1702-M-GigabitEthernet0/0/0]quit

[Core_1702]dis int bri
Brief information on interfaces in route mode:
Interface            Link Protocol Primary IP        Description
GE1/0/48             UP   UP       17.2.20.2
InLoop0              UP   UP(s)    --
MGE0/0/0             UP   UP       17.2.10.2
NULL0                UP   UP(s)    --
REG0                 UP   --       --
... (其他桥接模式接口信息省略) ...
```

### Access_1702 配置

```sh
<H3C>sys
[H3C]int m0/0/0
[H3C-M-GigabitEthernet0/0/0]ip add 17.2.10.3 24
[H3C-M-GigabitEthernet0/0/0]quit
[H3C]sysn Access_1702
[Access_1702]save force
Validating file. Please wait...
Saved the current configuration to mainboard device successfully.
```

### MGMT_1702 配置

```sh
<H3C>sys
[H3C]sysn MGMT_1702
[MGMT_1702]dis int bri
... (接口信息显示省略) ...
```

### 连通性测试 (Ping)

```sh
~> ping 17.2.10.1

正在 Ping 17.2.10.1 具有 32 字节的数据:
来自 17.2.10.1 的回复: 字节=32 时间=1ms TTL=255
来自 17.2.10.1 的回复: 字节=32 时间=9ms TTL=255
来自 17.2.10.1 的回复: 字节=32 时间=1ms TTL=255
来自 17.2.10.1 的回复: 字节=32 时间=6ms TTL=255

17.2.10.1 的 Ping 统计信息:
    数据包: 已发送 = 4，已接收 = 4，丢失 = 0 (0% 丢失)，
往返行程的估计时间(以毫秒为单位):
    最短 = 1ms，最长 = 9ms，平均 = 4ms
```

![69661a99192c9.png](https://bu.dusays.com/2026/01/13/69661a99192c9.png)

## 步骤2：SSH与自动化配置

### R_1702 (SSH与Netconf配置)

```sh
<R_1702>sys
[R_1702]public-key local create rsa
Input the modulus length [default = 1024]:
Generating Keys...
Created the key pair successfully.

[R_1702]ssh server enable
[R_1702]local-user admin class manage
New local user added.
[R_1702-luser-manage-admin]password simple Password@123
[R_1702-luser-manage-admin]service-type ssh terminal
[R_1702-luser-manage-admin]authorization-attribute user-role network-admin
[R_1702-luser-manage-admin]quit

[R_1702]user-interface vty 0 63
[R_1702-line-vty0-63]authentication-mode scheme
[R_1702-line-vty0-63]protocol inbound ssh
[R_1702-line-vty0-63]quit

[R_1702]netconf ssh server enable
[R_1702]save force
Validating file. Please wait...
Configuration is saved to device successfully.
```

### Access_1702 (SSH与Netconf配置)

```sh
<Access_1702>sys
[Access_1702]public-key local create rsa
Input the modulus length [default = 1024]:
Generating Keys...
Create the key pair successfully.

[Access_1702]ssh server enable
[Access_1702]local-user admin class manage
New local user added.
[Access_1702-luser-manage-admin]password simple Password@123
[Access_1702-luser-manage-admin]service-type ssh terminal
[Access_1702-luser-manage-admin]authorization-attribute user-role network-admin
[Access_1702-luser-manage-admin]quit

[Access_1702]user-interface vty 0 63
[Access_1702-line-vty0-63]authentication-mode scheme
[Access_1702-line-vty0-63]protocol inbound ssh
[Access_1702-line-vty0-63]quit

[Access_1702]netconf ssh server enable
[Access_1702]save force
Validating file. Please wait...
Saved the current configuration to mainboard device successfully.
```

### Core_1702 (SSH与Netconf配置)

```sh
<Core_1702>sys
[Core_1702]public-key local create rsa
Input the modulus length [default = 1024]:
Generating Keys...
Create the key pair successfully.

[Core_1702]ssh server enable
[Core_1702]local-user admin class manage
New local user added.
[Core_1702-luser-manage-admin]password simple Password@123
[Core_1702-luser-manage-admin]service-type ssh terminal
[Core_1702-luser-manage-admin]authorization-attribute user-role network-admin
[Core_1702-luser-manage-admin]quit

[Core_1702]user-interface vty 0 63
[Core_1702-line-vty0-63]authentication-mode scheme
[Core_1702-line-vty0-63]protocol inbound ssh
[Core_1702-line-vty0-63]quit

[Core_1702]netconf ssh server enable
[Core_1702]save force
Validating file. Please wait...
Saved the current configuration to mainboard device successfully.
```

### 验证 SSH 登录
(由于本机 OpenSSH 版本较高，强制使用 ssh-rsa 算法连接)
```sh
ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa admin@17.2.10.1
admin@17.2.10.1's password:
<R_1702>
```

### Core_1702 补充手动配置 (为Python脚本做准备)
```sh
[Core_1702]interface Vlan-interface 10
[Core_1702-Vlan-interface10]quit
[Core_1702]interface Vlan-interface 20
[Core_1702-Vlan-interface20]quit
[Core_1702]return
<Core_1702>save force
```

### R1 补充ACL配置
```sh
acl basic 2000
rule 0 permit source 192.168.0.0 0.0.255.255
```

### Python 自动化配置脚本

```py
import sys
from ncclient import manager
from ncclient.xml_ import to_ele

# ================= 基础配置 =================
DEVICE_PARAMS = {'name': 'h3c'}
USER = 'admin'
PASS = 'Password@123'

IP_ROUTER = '17.2.10.1'
IP_CORE   = '17.2.10.2'
IP_ACCESS = '17.2.10.3'

# 端口定义
PORT_AC_UP     = "GigabitEthernet1/0/48"
PORT_CORE_DOWN = "GigabitEthernet1/0/1"
PORT_CORE_UP   = "GigabitEthernet1/0/48"
PORT_R_LAN     = "GigabitEthernet0/0"
PORT_R_WAN     = "GigabitEthernet0/1"

# ================= XML 生成函数 =================

# 1. 纯 VLAN 创建
def get_vlan_create_xml(vlan_list):
    vlans_xml = ""
    for vid, vname in vlan_list:
        vlans_xml += f"""
        <VLANID>
            <ID>{vid}</ID>
            <Name>{vname}</Name>
        </VLANID>"""
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <VLAN>
          <VLANs>{vlans_xml}</VLANs>
        </VLAN>
      </top>
    </config>
    """

# 2. 端口链路类型 (1=Access, 2=Trunk)
def get_port_linktype_xml(interface_name, link_type):
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <Ifmgr>
          <Interfaces>
            <Interface>
              <IfIndex>{interface_name}</IfIndex>
              <LinkType>{link_type}</LinkType>
            </Interface>
          </Interfaces>
        </Ifmgr>
      </top>
    </config>
    """

# 3. Access 端口 VLAN
def get_access_vlan_xml(interface_name, vlan_id):
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <Ifmgr>
          <Interfaces>
            <Interface>
              <IfIndex>{interface_name}</IfIndex>
              <PVID>{vlan_id}</PVID>
            </Interface>
          </Interfaces>
        </Ifmgr>
      </top>
    </config>
    """

# 4. Trunk 端口放行
def get_trunk_permit_xml(interface_name, vlan_ids_str):
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <VLAN>
          <TrunkInterfaces>
            <Interface>
              <IfIndex>{interface_name}</IfIndex>
              <PermitVlanList>{vlan_ids_str}</PermitVlanList>
            </Interface>
          </TrunkInterfaces>
        </VLAN>
      </top>
    </config>
    """

# 5. IP 地址配置
def get_ip_xml(interface_name, ip, mask):
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <IPV4ADDRESS>
          <Ipv4Addresses>
            <Ipv4Address>
              <IfIndex>{interface_name}</IfIndex>
              <Ipv4Address>{ip}</Ipv4Address>
              <Ipv4Mask>{mask}</Ipv4Mask>
            </Ipv4Address>
          </Ipv4Addresses>
        </IPV4ADDRESS>
      </top>
    </config>
    """

# 6. 静态路由
def get_route_xml(dest_ip, mask_len, next_hop):
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <StaticRoute>
          <Ipv4StaticRouteConfigurations>
            <RouteEntry>
              <Ipv4Address>{dest_ip}</Ipv4Address>
              <Ipv4PrefixLength>{mask_len}</Ipv4PrefixLength>
              <NexthopIpv4Address>{next_hop}</NexthopIpv4Address>
              <DestVrfIndex>0</DestVrfIndex>
              <DestTopologyIndex>0</DestTopologyIndex>
              <NexthopVrfIndex>0</NexthopVrfIndex>
              <IfIndex>0</IfIndex>
            </RouteEntry>
          </Ipv4StaticRouteConfigurations>
        </StaticRoute>
      </top>
    </config>
    """

# 7. DHCP
def get_dhcp_xml(pool_index, pool_name, network_ip, mask, gateway):
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <DHCP>
          <DHCPConfig>
            <DHCPEnable>true</DHCPEnable>
          </DHCPConfig>
          <DHCPServerIpPool>
            <IpPool>
              <PoolIndex>{pool_index}</PoolIndex>
              <PoolName>{pool_name}</PoolName>
              <NetworkIpv4Address>{network_ip}</NetworkIpv4Address>
              <NetworkIpv4Mask>{mask}</NetworkIpv4Mask>
              <GatewayIpv4Address>{gateway}</GatewayIpv4Address>
            </IpPool>
          </DHCPServerIpPool>
        </DHCP>
      </top>
    </config>
    """

# 8. NAT
def get_nat_xml(interface_name):
    return f"""
    <config>
      <top xmlns="http://www.h3c.com/netconf/config:1.0">
        <NAT>
          <OutboundDynamicRules>
            <Interface>
              <IfIndex>{interface_name}</IfIndex>
              <ACLNumber>2000</ACLNumber>
            </Interface>
          </OutboundDynamicRules>
        </NAT>
      </top>
    </config>
    """

# ================= 发送引擎 =================
def push_config(ip, step_name, xml_payload):
    print(f"正在执行: {step_name} -> {ip} ...", end="")
    try:
        with manager.connect(host=ip, port=830, username=USER, password=PASS,
                             hostkey_verify=False, device_params=DEVICE_PARAMS,
                             allow_agent=False, look_for_keys=False) as m:
            
            reply = m.edit_config(target='running', config=xml_payload.strip())
            
            if "<ok/>" in reply.xml:
                print(" [成功]")
            else:
                print(f" [警告] {reply.xml[:100]}...")
                
            try:
                m.dispatch(to_ele('<action><top xmlns="http://www.h3c.com/netconf/action:1.0"><save><file>startup.cfg</file></save></top></action>'))
            except:
                pass

    except Exception as e:
        print(f"\n  [X] 失败: {str(e)}")

# ================= 主流程 =================
if __name__ == '__main__':
    print("=== 学号 1702 自动化配置 (已手工创建接口版) ===")

    # --- 1. Access 交换机 ---
    push_config(IP_ACCESS, "Access VLAN 创建", get_vlan_create_xml([(10, "vlan10"), (20, "vlan20")]))
    push_config(IP_ACCESS, "G1/0/1 -> VLAN 10", get_access_vlan_xml("GigabitEthernet1/0/1", 10))
    push_config(IP_ACCESS, "G1/0/2 -> VLAN 10", get_access_vlan_xml("GigabitEthernet1/0/2", 10))
    push_config(IP_ACCESS, "G1/0/3 -> VLAN 20", get_access_vlan_xml("GigabitEthernet1/0/3", 20))
    push_config(IP_ACCESS, "G1/0/4 -> VLAN 20", get_access_vlan_xml("GigabitEthernet1/0/4", 20))
    push_config(IP_ACCESS, "G1/0/48 设为 Trunk", get_port_linktype_xml(PORT_AC_UP, 2))
    push_config(IP_ACCESS, "G1/0/48 放行 VLAN", get_trunk_permit_xml(PORT_AC_UP, "10,20"))

    # --- 2. Core 交换机 ---
    push_config(IP_CORE, "Core VLAN 创建", get_vlan_create_xml([(10, "vlan10"), (20, "vlan20")]))
    push_config(IP_CORE, "G1/0/1 设为 Trunk", get_port_linktype_xml(PORT_CORE_DOWN, 2))
    push_config(IP_CORE, "G1/0/1 放行 VLAN", get_trunk_permit_xml(PORT_CORE_DOWN, "10,20"))
    
    push_config(IP_CORE, "Vlan-int10 IP", get_ip_xml("Vlan-interface10", "192.168.10.1", "255.255.255.0"))
    push_config(IP_CORE, "Vlan-int20 IP", get_ip_xml("Vlan-interface20", "192.168.20.1", "255.255.255.0"))
    push_config(IP_CORE, "Uplink IP", get_ip_xml(PORT_CORE_UP, "17.2.20.2", "255.255.255.252"))
    
    push_config(IP_CORE, "DHCP Pool 10", get_dhcp_xml(1, "pool10", "192.168.10.0", "255.255.255.0", "192.168.10.1"))
    push_config(IP_CORE, "DHCP Pool 20", get_dhcp_xml(2, "pool20", "192.168.20.0", "255.255.255.0", "192.168.20.1"))
    push_config(IP_CORE, "默认路由", get_route_xml("0.0.0.0", "0", "17.2.20.1"))

    # --- 3. 路由器 R1 ---
    push_config(IP_ROUTER, "LAN 口 IP", get_ip_xml(PORT_R_LAN, "17.2.20.1", "255.255.255.252"))
    push_config(IP_ROUTER, "WAN 口 IP", get_ip_xml(PORT_R_WAN, "202.100.17.2", "255.255.255.0"))
    push_config(IP_ROUTER, "回程路由", get_route_xml("192.168.0.0", "16", "17.2.20.2"))
    push_config(IP_ROUTER, "NAT Outbound", get_nat_xml(PORT_R_WAN))

    print("\n=== 全部配置完成! 请立即测试 Host01 自动获取 IP 和 Ping 外网 ===")
```

![69661f634dc0d.png](https://bu.dusays.com/2026/01/13/69661f634dc0d.png)

### 验证: PC获取 IP 与连通性

**IP 配置情况:**

![69662c72688a8.png](https://bu.dusays.com/2026/01/13/69662c72688a8.png)

**外网连通性测试:**

![69662ccf63736.png](https://bu.dusays.com/2026/01/13/69662ccf63736.png)