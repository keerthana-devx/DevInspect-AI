import Workspace from '../models/Workspace.js';
import User from '../models/User.js';

export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Workspace name is required' });

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    // Find workspaces where user is owner or in members array
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ message: 'User email is required' });

    const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user._id });
    if (!workspace) return res.status(404).json({ message: 'Workspace not found or not owned by you' });

    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ message: 'User with this email not found' });

    // Check if user is already a member
    const alreadyMember = workspace.members.some(m => String(m.user) === String(invitee._id));
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member of this workspace' });

    workspace.members.push({ user: invitee._id, role: role || 'Developer' });
    await workspace.save();

    const updatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
