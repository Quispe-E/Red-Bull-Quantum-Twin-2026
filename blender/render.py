import bpy
import sys
import os

# Get arguments passed after --
argv = sys.argv
argv = argv[argv.index("--") + 1:]
ers_status = argv[0] if len(argv) > 0 else "NORMAL"  # NORMAL, ALERTA, CRÍTICO
output_path = argv[1] if len(argv) > 1 else "blender/render_output.png"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import OBJ
obj_path = os.path.join(SCRIPT_DIR, "tinker.obj")
bpy.ops.wm.obj_import(filepath=obj_path)

# Set material color based on ERS status
color_map = {
    "NORMAL": (0.0, 1.0, 0.53, 1.0),    # green #00ff88
    "ALERTA": (1.0, 0.8, 0.0, 1.0),     # yellow #ffcc00
    "CRÍTICO": (0.8, 0.0, 0.0, 1.0),    # red #cc0000
    "CRITICO": (0.8, 0.0, 0.0, 1.0),    # red (ascii alias)
    "PELIGRO": (0.8, 0.0, 0.0, 1.0),    # red
}
color = color_map.get(ers_status.upper(), color_map["NORMAL"])

# Apply color to all mesh objects
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        mat = bpy.data.materials.new(name="ERS_Material")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Emission Color"].default_value = color
        bsdf.inputs["Emission Strength"].default_value = 0.3
        bsdf.inputs["Metallic"].default_value = 0.8
        bsdf.inputs["Roughness"].default_value = 0.2
        obj.data.materials.clear()
        obj.data.materials.append(mat)

# Camera setup
bpy.ops.object.camera_add(location=(5, -5, 3))
camera = bpy.context.object
camera.rotation_euler = (1.1, 0, 0.785)
bpy.context.scene.camera = camera

# World background — dark like dashboard
world = bpy.context.scene.world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.05, 0.07, 1)

# Lighting
bpy.ops.object.light_add(type='SUN', location=(3, -3, 5))
light = bpy.context.object
light.data.energy = 3

# Render settings
render = bpy.context.scene.render
render.engine = 'BLENDER_EEVEE_NEXT'
render.resolution_x = 800
render.resolution_y = 500
render.image_settings.file_format = 'PNG'

if not os.path.isabs(output_path):
    output_path = os.path.join(PROJECT_ROOT, output_path)

os.makedirs(os.path.dirname(output_path), exist_ok=True)
render.filepath = output_path

# Render
bpy.ops.render.render(write_still=True)
print(f"Rendered: {output_path} with ERS status: {ers_status}")
