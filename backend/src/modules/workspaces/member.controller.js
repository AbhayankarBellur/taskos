import { memberService } from "./member.service.js";

export const memberController = {
  list: async (req, res) => {
    const members = await memberService.list(req.ctx);
    res.json({ success: true, data: members });
  },

  add: async (req, res) => {
    const member = await memberService.add(req.ctx, req.body);
    res.status(201).json({ success: true, data: member });
  },

  changeRole: async (req, res) => {
    const member = await memberService.changeRole(req.ctx, req.params.userId, req.body);
    res.json({ success: true, data: member });
  },

  remove: async (req, res) => {
    await memberService.remove(req.ctx, req.params.userId);
    res.json({ success: true, data: null });
  }
};
