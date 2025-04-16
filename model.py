import os
import torch
from ultralytics import YOLO
import argparse
import gc

# ===== GPU CONFIGURATION =====
os.environ['CUDA_VISIBLE_DEVICES'] = '0'
os.environ['CUDA_DEVICE_ORDER'] = 'PCI_BUS_ID'
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True,garbage_collection_threshold:0.8"
torch.backends.cudnn.benchmark = True
torch.set_float32_matmul_precision('high')

def verify_gpu():
    """Verify and configure GPU settings"""
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA device not available!")
    device = torch.device('cuda:0')
    print(f"\n=== GPU CONFIGURATION ===")
    print(f"Device: {torch.cuda.get_device_name(device)}")
    print(f"VRAM: {torch.cuda.get_device_properties(device).total_memory/1e9:.2f} GB")
    print(f"CUDA: {torch.version.cuda}\n")
    return device

def clear_memory():
    """Clear GPU and system memory"""
    gc.collect()
    torch.cuda.empty_cache()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv8 on RTX 4060 Laptop")
    parser.add_argument("--yaml", required=False, help="Path to dataset.yaml (required for new training)")
    parser.add_argument("--resume", default=None, help="Path to checkpoint .pt file to resume training")
    parser.add_argument("--model", default="yolov8n.pt", help="Model version")
    parser.add_argument("--img_size", type=int, default=512, help="Image size")
    parser.add_argument("--epochs", type=int, default=10, help="Total training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    
    args = parser.parse_args()
    
    # Verify GPU
    device = verify_gpu()
    clear_memory()
    torch.cuda.set_per_process_memory_fraction(0.85)

    # Training configuration
    train_args = {
        'imgsz': args.img_size,
        'epochs': args.epochs,
        'batch': args.batch,
        'device': 0,
        'workers': 2,
        'optimizer': 'Adam',
        'lr0': 0.0005,
        'cos_lr': True,
        'warmup_epochs': 2,
        'weight_decay': 0.0005,
        'amp': True,
        'patience': 10,
        'save': True,
        'save_period': 5,
        'single_cls': False,
        'verbose': True,
        'seed': 42,
        'cache': 'ram',
        'close_mosaic': 3,
        'exist_ok': True
    }

    print("\n⚡ TRAINING CONFIGURATION ⚡")
    print(f"• Model: {args.model}")
    print(f"• Image Size: {args.img_size}x{args.img_size}")
    print(f"• Batch Size: {args.batch}")
    print(f"• Epochs: {args.epochs}")
    print(f"• Device: {torch.cuda.get_device_name(0)}")
    print(f"• Mixed Precision: Enabled\n")

    if args.resume:
        # Resume training - let YOLO handle the epoch counting internally
        print(f"🚀 Resuming training from {args.resume}")
        model = YOLO(args.resume)
        train_args['resume'] = True
    else:
        # New training
        if not args.yaml:
            raise ValueError("--yaml argument is required for new training")
        if not os.path.exists(args.yaml):
            raise FileNotFoundError(f"Dataset config not found at {args.yaml}")
        print(f"🔥 Starting new training with {args.model}")
        model = YOLO(args.model)
        train_args['data'] = args.yaml

    # Start training - epochs will be handled correctly
    clear_memory()
    results = model.train(**train_args)