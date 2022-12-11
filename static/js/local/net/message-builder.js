import { InfoMessage, VerMessage } from './socket-messages.js?version=100'

// TODO: crea tutti i js mancanti da D:\scratch\angular\cli_app\cli-cup-client6\src\app\data-models

import { UserLogoutOk, UserLoginFailed, UserLoginOk, UserExistResult, UserOperationResult } from './UserMessage.js'
import { List2Message } from './List2Message.js'
import { ChatMessage } from './ChatMessage.js'
import { JoinMessage } from './JoinMessage.js';
import { InGameMessage } from './InGameMessage.js';
import { GameStatusMessage } from './GameStatusMessage.js';


export class MessageBuilder {

  static parse(srv_message){
    let arr_cmd_msg = srv_message.split(":");
    let cmd = arr_cmd_msg[0];
    // details of command
    arr_cmd_msg = arr_cmd_msg.slice(1, arr_cmd_msg.length);
    let cmd_details = arr_cmd_msg.join(":");
    //retreive the symbol of the command handler
    var result = null;
    switch (cmd) {
      case 'INFO':
        {
          let msg = new InfoMessage();
          msg.cmd = cmd;
          msg.info = cmd_details;
          result = msg;
          break;
        }
      case 'VER':
        {
          let msg = new VerMessage();
          msg.cmd = cmd;
          msg.parseDetails(cmd_details);
          result = msg;
          break;
        }
      case 'LOGINERROR':
        {
          let msg = new UserLoginFailed(cmd, cmd_details);
          result = msg;
          break;
        }
      case 'LOGINOK':
        {
          let msg = new UserLoginOk(cmd, cmd_details);
          result = msg;
          break;
        }
      case 'LOGOUTOK':
        {
          let msg = new UserLogoutOk(cmd, cmd_details);
          result = msg;
          break;
        }
      case 'USEREXISTRESULT':
        {
          let msg = new UserExistResult(cmd, cmd_details);
          result = msg;
          break;
        }
      case 'USEROPRESULT':
        {
          let msg = new UserOperationResult(cmd, cmd_details);
          result = msg;
          break;
        }
      case 'LIST2':
        {
          let msg = new List2Message();
          msg.cmd = cmd;

          msg.parseCmdDetails(cmd_details);
          result = msg;
          break;
        }
      case 'LIST2ADD':
        {
          let msg = new List2Message();
          msg.cmd = cmd;
          msg.parseCmdAddSingleDetail(cmd_details);
          result = msg;
          break;
        }
      case 'LIST2REMOVE':
        {
          let msg = new List2Message();
          msg.cmd = cmd;
          msg.parseCmdRemoveSingleDetail(cmd_details);
          result = msg;
          break;
        }
      case 'GAMESTATUS':
        {
          let msg = new GameStatusMessage();
          msg.cmd = cmd;
          msg.parseDetails(cmd_details);
          result = msg;
          break;
        }
      case 'CHATTAVOLO':
      case 'CHATLOBBY':
        {
          let msg = new ChatMessage();
          msg.cmd = cmd;
          msg.parseCmdDetails(cmd_details);
          result = msg;
          break;
        }
      case 'PGCREATEREJECT':
        {
          let msg = new ChatMessage()
          msg.cmd = cmd;
          msg.parseServerMsgCmdDetails(cmd_details);
          result = msg;
          break;
        }
      case 'PGJOINOK':
        {
          let msg = new JoinMessage()
          msg.cmd = cmd
          msg.parseDetailsJoinOK(cmd_details)
          result = msg
          break
        }
      case 'ONALGNEWMATCH':
      case 'ONALGNEWGIOCATA':
      case 'ONALGNEWMANO':
      case 'ONALGHAVETOPLAY':
        {
          let msg = new InGameMessage(cmd_details, cmd)
          result = msg
          break
        }
      default:
        console.warn('Parseframe: ignore message ' + srv_message);
        break;
    }

    return result;
  }
}
